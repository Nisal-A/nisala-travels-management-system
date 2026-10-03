<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingDraft;
use App\Models\BookingNote;
use App\Models\BookingTraveler;
use App\Models\Customer;
use App\Models\CustomerDocument;
use App\Models\Employee;
use App\Models\Payment;
use App\Models\PaymentSchedule;
use App\Models\TourPackage;
use App\Models\ActivityLog;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Enums\BookingStatus;
use App\Enums\TravelerType;
use App\Enums\UserRole;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Booking::class);

        $perPage = $request->input('per_page', 10);
        $bookings = Booking::with(['customer', 'tourPackage', 'assignedTo'])
            ->filterAndSort($request->all())
            ->paginate($perPage)
            ->withQueryString();

        $savedFilters = \App\Models\SavedFilter::where('user_id', $request->user()->id)
            ->where('table_key', 'bookings')
            ->get();

        return Inertia::render('Bookings/Index', [
            'bookings' => $bookings,
            'filters' => $request->all(),
            'savedFilters' => $savedFilters,
        ]);
    }

    private function validateCapacity(TourPackage $package, int $newTravelerCount, ?int $excludeBookingId = null)
    {
        if (!$package->capacity) return;

        $existingTravelersQuery = BookingTraveler::whereHas('booking', function ($q) use ($package, $excludeBookingId) {
            $q->where('tour_package_id', $package->id)
              ->whereIn('booking_status', [BookingStatus::Pending->value, BookingStatus::Confirmed->value, BookingStatus::Completed->value]);
            if ($excludeBookingId) {
                $q->where('id', '!=', $excludeBookingId);
            }
        });

        $existingCount = $existingTravelersQuery->count();
        if (($existingCount + $newTravelerCount) > $package->capacity) {
            throw ValidationException::withMessages([
                'travelers' => 'Tour package capacity exceeded. Only ' . max(0, $package->capacity - $existingCount) . ' seats available.'
            ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('create', Booking::class);

        $customers = Customer::select('id', 'customer_id', 'first_name', 'last_name', 'email', 'phone', 'passport_number', 'nationality')
            ->orderBy('first_name')
            ->limit(50)
            ->get();

        $packages = TourPackage::select('id', 'name', 'price', 'currency', 'capacity', 'duration_days')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        $employees = Employee::select('id', 'first_name', 'last_name', 'designation')
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get();

        $existingDraft = BookingDraft::where('user_id', $request->user()->id)->first();

        return Inertia::render('Bookings/Create', [
            'customers' => $customers,
            'packages' => $packages,
            'employees' => $employees,
            'travelerTypes' => array_column(TravelerType::cases(), 'value'),
            'canDiscount' => $request->user()->can('applyDiscount', Booking::class),
            'existingDraft' => $existingDraft ? [
                'id' => $existingDraft->id,
                'step' => $existingDraft->step,
                'payload' => $existingDraft->payload,
                'updated_at' => $existingDraft->updated_at->toIso8601String(),
            ] : null,
        ]);
    }

    /**
     * Save draft autosave.
     */
    public function saveDraft(Request $request)
    {
        Gate::authorize('create', Booking::class);

        $validated = $request->validate([
            'payload' => ['required', 'array'],
            'step' => ['nullable', 'integer', 'min:1', 'max:6'],
        ]);

        $draft = BookingDraft::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'payload' => $validated['payload'],
                'step' => $validated['step'] ?? 1,
            ]
        );

        return response()->json([
            'success' => true,
            'saved_at' => $draft->updated_at->toIso8601String(),
        ]);
    }

    /**
     * Get draft for authenticated user.
     */
    public function getDraft(Request $request)
    {
        Gate::authorize('create', Booking::class);

        $draft = BookingDraft::where('user_id', $request->user()->id)->first();

        return response()->json([
            'draft' => $draft ? [
                'id' => $draft->id,
                'step' => $draft->step,
                'payload' => $draft->payload,
                'updated_at' => $draft->updated_at->toIso8601String(),
            ] : null,
        ]);
    }

    /**
     * Delete draft for authenticated user.
     */
    public function deleteDraft(Request $request)
    {
        Gate::authorize('create', Booking::class);

        BookingDraft::where('user_id', $request->user()->id)->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookingRequest $request)
    {
        Gate::authorize('create', Booking::class);
        $validated = $request->validated();

        $package = TourPackage::findOrFail($validated['tour_package_id']);
        $travelersCount = count($validated['travelers']);

        $this->validateCapacity($package, $travelersCount);

        try {
            DB::beginTransaction();

            // SERVER-SIDE PRICE CALCULATION (Never trust client totals)
            $baseAmount = (float)$package->price * $travelersCount;

            $extrasAmount = 0;
            $extrasList = [];
            if (!empty($validated['extras']) && is_array($validated['extras'])) {
                foreach ($validated['extras'] as $extra) {
                    if (!empty($extra['name']) && isset($extra['price'])) {
                        $price = max(0, (float)$extra['price']);
                        $extrasAmount += $price;
                        $extrasList[] = [
                            'name' => $extra['name'],
                            'price' => $price,
                        ];
                    }
                }
            }

            $taxAmount = max(0, (float)($validated['tax_amount'] ?? 0));
            $discount = max(0, (float)($validated['discount_amount'] ?? 0));

            // Permission check for discount was verified in StoreBookingRequest withValidator,
            // but double check here as defense-in-depth:
            if ($discount > 0 && !$request->user()->can('applyDiscount', Booking::class)) {
                throw ValidationException::withMessages([
                    'discount_amount' => 'You do not have permission to authorize discounts.'
                ]);
            }

            $finalAmount = max(0, ($baseAmount + $extrasAmount + $taxAmount) - $discount);

            // Record initial payment if requested
            $recordPayment = !empty($validated['record_payment']);
            $initialPaymentAmount = $recordPayment ? min($finalAmount, max(0, (float)($validated['payment_amount'] ?? 0))) : 0;
            $paidAmount = $initialPaymentAmount;
            $balanceAmount = max(0, $finalAmount - $paidAmount);
            $paymentStatus = $paidAmount >= $finalAmount && $finalAmount > 0 ? 'Paid' : ($paidAmount > 0 ? 'Partial' : 'Unpaid');

            $latest = Booking::withTrashed()->orderBy('id', 'desc')->first();
            $nextId = $latest ? $latest->id + 1 : 1;
            $bookingRef = 'NT-' . date('Y') . '-' . str_pad((string)$nextId, 6, '0', STR_PAD_LEFT);

            $booking = Booking::create([
                'booking_reference' => $bookingRef,
                'customer_id' => $validated['customer_id'],
                'tour_package_id' => $package->id,
                'assigned_to' => $validated['assigned_to'] ?? null,
                'booking_date' => $validated['booking_date'],
                'travel_date' => $validated['travel_date'],
                'return_date' => $validated['return_date'] ?? null,
                'number_of_travelers' => $travelersCount,
                'base_amount' => $baseAmount,
                'discount_amount' => $discount,
                'extras_amount' => $extrasAmount,
                'tax_amount' => $taxAmount,
                'extras' => $extrasList,
                'final_amount' => $finalAmount,
                'paid_amount' => $paidAmount,
                'balance_amount' => $balanceAmount,
                'currency' => $package->currency ?? 'LKR',
                'booking_status' => BookingStatus::Pending,
                'payment_status' => $paymentStatus,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            // Create Travelers
            $booking->travelers()->createMany($validated['travelers']);

            // Create Payment Schedules
            if (!empty($validated['payment_schedules']) && is_array($validated['payment_schedules'])) {
                foreach ($validated['payment_schedules'] as $index => $sched) {
                    $schedAmount = (float)$sched['amount'];
                    $isPaid = false;
                    if ($index === 0 && $initialPaymentAmount >= $schedAmount && $schedAmount > 0) {
                        $isPaid = true;
                    }
                    PaymentSchedule::create([
                        'booking_id' => $booking->id,
                        'description' => $sched['description'] ?? 'Installment ' . ($index + 1),
                        'amount' => $schedAmount,
                        'due_date' => $sched['due_date'],
                        'status' => $isPaid ? 'paid' : 'unpaid',
                    ]);
                }
            } else {
                // Generate default 2-part schedule: 20% Deposit, 80% Final Balance
                $deposit = round($finalAmount * 0.20, 2);
                $balance = $finalAmount - $deposit;
                $travelDate = \Carbon\Carbon::parse($validated['travel_date']);
                $balanceDue = $travelDate->copy()->subDays(30)->isPast() ? $travelDate->toDateString() : $travelDate->copy()->subDays(30)->toDateString();

                PaymentSchedule::create([
                    'booking_id' => $booking->id,
                    'description' => 'Deposit (20%)',
                    'amount' => $deposit,
                    'due_date' => $validated['booking_date'],
                    'status' => ($initialPaymentAmount >= $deposit && $deposit > 0) ? 'paid' : 'unpaid',
                ]);

                if ($balance > 0) {
                    PaymentSchedule::create([
                        'booking_id' => $booking->id,
                        'description' => 'Final Balance',
                        'amount' => $balance,
                        'due_date' => $balanceDue,
                        'status' => 'unpaid',
                    ]);
                }
            }

            // Record First Payment if requested
            if ($recordPayment && $initialPaymentAmount > 0) {
                $payment = Payment::create([
                    'booking_id' => $booking->id,
                    'customer_id' => $booking->customer_id,
                    'amount' => $initialPaymentAmount,
                    'currency' => $booking->currency,
                    'payment_method' => $validated['payment_method'] ?? 'cash',
                    'payment_date' => $validated['booking_date'] ?? now()->toDateString(),
                    'reference_number' => $validated['payment_reference'] ?? ('RCP-' . strtoupper(Str::random(8))),
                    'recorded_by' => $request->user()->id,
                    'notes' => 'Initial payment recorded during booking creation',
                    'status' => \App\Enums\PaymentStatus::Completed,
                ]);

                DB::afterCommit(fn () => event(new \App\Events\PaymentReceived($payment)));
            }

            // Write initial entry to Notes Timeline
            BookingNote::create([
                'booking_id' => $booking->id,
                'user_id' => $request->user()->id,
                'content' => "Booking {$booking->booking_reference} created with {$travelersCount} traveler(s). Total: " . number_format($finalAmount, 2) . " {$booking->currency}.",
                'type' => 'status_change',
            ]);

            // Write Activity Log
            ActivityLog::create([
                'log_name' => 'booking',
                'description' => "Booking {$booking->booking_reference} created",
                'subject_type' => Booking::class,
                'subject_id' => $booking->id,
                'causer_type' => get_class($request->user()),
                'causer_id' => $request->user()->id,
                'properties' => [
                    'reference' => $booking->booking_reference,
                    'final_amount' => $finalAmount,
                    'travelers_count' => $travelersCount,
                ]
            ]);

            // Delete Draft after successful creation
            BookingDraft::where('user_id', $request->user()->id)->delete();

            DB::commit();
            return redirect()->route('bookings.show', $booking)->with('success', 'Booking created successfully.');
        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()->withErrors(['error' => 'Failed to create booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        Gate::authorize('view', $booking);

        $booking->load([
            'customer.documents.documentType',
            'tourPackage.destination',
            'travelers.customer.documents',
            'payments.recordedBy:id,name',
            'paymentSchedules',
            'bookingNotes.user:id,name',
            'bookingNotes.replies.user:id,name',
            'assignedTo:id,first_name,last_name,designation,email,phone',
            'createdBy:id,name',
            'updatedBy:id,name'
        ]);

        $activityLogs = ActivityLog::where('subject_type', Booking::class)
            ->where('subject_id', $booking->id)
            ->with('causer:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        $employees = Employee::select('id', 'first_name', 'last_name', 'designation')
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get();

        // Calculate traveler document checklist
        $travelersWithDocs = $booking->travelers->map(function ($traveler) use ($booking) {
            // Check if customer has passport document
            $hasPassportNo = !empty($traveler->passport_number);
            $passportExpired = false;
            if ($traveler->passport_expiry) {
                $passportExpired = \Carbon\Carbon::parse($traveler->passport_expiry)->isPast();
            }

            // Customer linked documents
            $docs = $booking->customer?->documents ?? collect();
            $passportDoc = $docs->firstWhere('documentType.name', 'Passport');
            $visaDoc = $docs->firstWhere('documentType.name', 'Visa');

            return [
                'id' => $traveler->id,
                'full_name' => $traveler->full_name,
                'traveler_type' => $traveler->traveler_type?->value ?? $traveler->traveler_type,
                'passport_number' => $traveler->passport_number,
                'passport_expiry' => $traveler->passport_expiry?->format('Y-m-d'),
                'dob' => $traveler->dob?->format('Y-m-d'),
                'gender' => $traveler->gender,
                'nationality' => $traveler->nationality,
                'special_requirements' => $traveler->special_requirements,
                'checklist' => [
                    'passport_info' => $hasPassportNo && !$passportExpired ? 'valid' : ($passportExpired ? 'expired' : 'missing'),
                    'passport_doc' => $passportDoc ? ($passportDoc->verification_status ?? 'pending') : 'missing',
                    'visa_doc' => $visaDoc ? ($visaDoc->verification_status ?? 'pending') : 'not_required',
                ]
            ];
        });

        return Inertia::render('Bookings/Show', [
            'booking' => $booking,
            'travelersWithDocs' => $travelersWithDocs,
            'activityLogs' => $activityLogs,
            'employees' => $employees,
            'permissions' => [
                'canUpdate' => auth()->user()->can('update', $booking),
                'canCancel' => auth()->user()->can('cancel', $booking),
                'canChangeStatus' => auth()->user()->can('changeStatus', $booking),
                'canRecordPayment' => auth()->user()->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value]),
                'canDiscount' => auth()->user()->can('applyDiscount', Booking::class),
                'canAddNote' => auth()->user()->can('addNote', $booking),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking)
    {
        Gate::authorize('update', $booking);

        $booking->load(['travelers', 'customer', 'tourPackage', 'paymentSchedules']);
        $customers = Customer::select('id', 'customer_id', 'first_name', 'last_name', 'email', 'phone', 'passport_number', 'nationality')
            ->orderBy('first_name')
            ->get();
        $packages = TourPackage::select('id', 'name', 'price', 'currency', 'capacity', 'duration_days')
            ->where('status', 'active')
            ->orderBy('name')
            ->get();
        $employees = Employee::select('id', 'first_name', 'last_name', 'designation')
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get();

        return Inertia::render('Bookings/Create', [
            'booking' => $booking,
            'customers' => $customers,
            'packages' => $packages,
            'employees' => $employees,
            'travelerTypes' => array_column(TravelerType::cases(), 'value'),
            'canDiscount' => auth()->user()->can('applyDiscount', Booking::class),
            'isEditing' => true,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        Gate::authorize('update', $booking);

        if (in_array($booking->booking_status->value, [BookingStatus::Cancelled->value, BookingStatus::Completed->value])) {
            return back()->withErrors(['error' => 'Bookings cannot be modified once completed or cancelled.']);
        }

        $validated = $request->validated();

        if ($booking->booking_status === BookingStatus::Confirmed) {
            if (isset($validated['tour_package_id']) && $validated['tour_package_id'] != $booking->tour_package_id) {
                return back()->withErrors(['error' => 'Cannot change the tour package of a confirmed booking.']);
            }
        }

        $travelers = $validated['travelers'] ?? null;
        unset($validated['travelers']);

        if ($travelers !== null) {
            $this->validateCapacity($booking->tourPackage, count($travelers), $booking->id);
        }

        try {
            DB::beginTransaction();

            $validated['updated_by'] = $request->user()->id;

            // Recalculate amounts if discount or travelers changed
            if ($travelers !== null) {
                $baseAmount = $booking->tourPackage->price * count($travelers);
                $discount = isset($validated['discount_amount']) ? (float)$validated['discount_amount'] : (float)$booking->discount_amount;
                $extrasAmount = isset($validated['extras_amount']) ? (float)$validated['extras_amount'] : (float)$booking->extras_amount;
                $taxAmount = isset($validated['tax_amount']) ? (float)$validated['tax_amount'] : (float)$booking->tax_amount;

                $finalAmount = max(0, ($baseAmount + $extrasAmount + $taxAmount) - $discount);
                $balanceAmount = max(0, $finalAmount - (float)$booking->paid_amount);

                $validated['number_of_travelers'] = count($travelers);
                $validated['base_amount'] = $baseAmount;
                $validated['discount_amount'] = $discount;
                $validated['final_amount'] = $finalAmount;
                $validated['balance_amount'] = $balanceAmount;
            } elseif (isset($validated['discount_amount'])) {
                $discount = (float)$validated['discount_amount'];
                $finalAmount = max(0, ($booking->base_amount + $booking->extras_amount + $booking->tax_amount) - $discount);
                $validated['discount_amount'] = $discount;
                $validated['final_amount'] = $finalAmount;
                $validated['balance_amount'] = max(0, $finalAmount - (float)$booking->paid_amount);
            }

            $booking->update($validated);

            if ($travelers !== null) {
                $providedIds = collect($travelers)->pluck('id')->filter()->toArray();
                $booking->travelers()->whereNotIn('id', $providedIds)->delete();

                foreach ($travelers as $travelerData) {
                    if (isset($travelerData['id']) && $travelerData['id']) {
                        $booking->travelers()->where('id', $travelerData['id'])->update($travelerData);
                    } else {
                        $booking->travelers()->create($travelerData);
                    }
                }
            }

            BookingNote::create([
                'booking_id' => $booking->id,
                'user_id' => $request->user()->id,
                'content' => 'Booking details updated by ' . $request->user()->name . '.',
                'type' => 'note',
            ]);

            DB::commit();
            return redirect()->route('bookings.show', $booking)->with('success', 'Booking updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Change booking status with timeline logging.
     */
    public function changeStatus(Request $request, Booking $booking)
    {
        Gate::authorize('changeStatus', $booking);

        $validated = $request->validate([
            'booking_status' => ['required', \Illuminate\Validation\Rule::enum(BookingStatus::class)],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $newStatus = BookingStatus::from($validated['booking_status']);
        $currentStatus = $booking->booking_status;

        $validTransitions = [
            BookingStatus::Pending->value => [BookingStatus::Confirmed->value, BookingStatus::Cancelled->value],
            BookingStatus::Confirmed->value => [BookingStatus::Completed->value, BookingStatus::Cancelled->value],
            BookingStatus::Completed->value => [],
            BookingStatus::Cancelled->value => [],
        ];

        if (!in_array($newStatus->value, $validTransitions[$currentStatus->value] ?? [])) {
            return back()->withErrors(['error' => "Invalid status transition from {$currentStatus->value} to {$newStatus->value}."]);
        }

        if ($newStatus === BookingStatus::Cancelled) {
            Gate::authorize('cancel', $booking);
        }

        try {
            DB::beginTransaction();

            if ($newStatus === BookingStatus::Confirmed) {
                $this->validateCapacity($booking->tourPackage, $booking->number_of_travelers, $booking->id);
            }

            $booking->update([
                'booking_status' => $newStatus,
                'updated_by' => $request->user()->id
            ]);

            $noteContent = "Status changed from {$currentStatus->label()} to {$newStatus->label()}.";
            if (!empty($validated['note'])) {
                $noteContent .= " Note: " . $validated['note'];
            }

            // Write entry to Notes timeline
            BookingNote::create([
                'booking_id' => $booking->id,
                'user_id' => $request->user()->id,
                'content' => $noteContent,
                'type' => 'status_change',
            ]);

            // Write activity log
            ActivityLog::create([
                'log_name' => 'booking',
                'description' => "Status changed from {$currentStatus->label()} to {$newStatus->label()}",
                'subject_type' => Booking::class,
                'subject_id' => $booking->id,
                'causer_type' => get_class($request->user()),
                'causer_id' => $request->user()->id,
                'properties' => [
                    'from' => $currentStatus->value,
                    'to' => $newStatus->value,
                    'note' => $validated['note'] ?? null,
                ]
            ]);

            if ($newStatus === BookingStatus::Confirmed && $currentStatus !== BookingStatus::Confirmed) {
                DB::afterCommit(fn () => event(new \App\Events\BookingConfirmed($booking)));
            }

            DB::commit();
            return back()->with('success', 'Booking status updated to ' . $newStatus->label());
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update booking status: ' . $e->getMessage()]);
        }
    }

    /**
     * Add threaded internal note to booking.
     */
    public function addNote(Request $request, Booking $booking)
    {
        Gate::authorize('addNote', $booking);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'exists:booking_notes,id'],
        ]);

        $note = BookingNote::create([
            'booking_id' => $booking->id,
            'user_id' => $request->user()->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'content' => $validated['content'],
            'type' => 'note',
        ]);

        ActivityLog::create([
            'log_name' => 'booking',
            'description' => 'Internal note added to booking ' . $booking->booking_reference,
            'subject_type' => Booking::class,
            'subject_id' => $booking->id,
            'causer_type' => get_class($request->user()),
            'causer_id' => $request->user()->id,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'note' => $note->load('user:id,name'),
            ], 201);
        }

        return back()->with('success', 'Note added successfully.');
    }

    /**
     * Assign staff member to booking.
     */
    public function assignStaff(Request $request, Booking $booking)
    {
        Gate::authorize('update', $booking);

        $validated = $request->validate([
            'assigned_to' => ['nullable', 'exists:employees,id'],
        ]);

        $booking->update([
            'assigned_to' => $validated['assigned_to'] ?? null,
            'updated_by' => $request->user()->id,
        ]);

        $employeeName = $booking->assignedTo ? "{$booking->assignedTo->first_name} {$booking->assignedTo->last_name}" : 'Unassigned';

        BookingNote::create([
            'booking_id' => $booking->id,
            'user_id' => $request->user()->id,
            'content' => "Assigned staff updated to {$employeeName}.",
            'type' => 'system',
        ]);

        return back()->with('success', 'Staff assignment updated.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking)
    {
        Gate::authorize('delete', $booking);
        $booking->update(['updated_by' => auth()->id()]);
        $booking->delete();
        return redirect()->route('bookings.index')->with('success', 'Booking archived successfully.');
    }

    /**
     * Restore the specified resource.
     */
    public function restore($id)
    {
        $booking = Booking::withTrashed()->findOrFail($id);
        Gate::authorize('restore', $booking);

        $booking->restore();
        $booking->update(['updated_by' => auth()->id()]);

        return back()->with('success', 'Booking restored successfully.');
    }
}
