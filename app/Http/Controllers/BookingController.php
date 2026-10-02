<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Booking;
use App\Models\TourPackage;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\UpdateBookingRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;
use App\Enums\BookingStatus;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Booking::class);

        $perPage = $request->input('per_page', 10);
        $bookings = Booking::with(['customer', 'tourPackage'])
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

        $existingTravelersQuery = \App\Models\BookingTraveler::whereHas('booking', function($q) use ($package, $excludeBookingId) {
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
    public function create()
    {
        Gate::authorize('create', Booking::class);

        $customers = \App\Models\Customer::select('id', 'first_name', 'last_name', 'email')->orderBy('first_name')->get();
        $packages = TourPackage::select('id', 'name', 'price', 'currency', 'capacity', 'duration_days')->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('Bookings/Create', [
            'customers' => $customers,
            'packages' => $packages,
            'travelerTypes' => array_column(\App\Enums\TravelerType::cases(), 'value'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookingRequest $request)
    {
        Gate::authorize('create', Booking::class);
        $validated = $request->validated();
        
        $package = TourPackage::findOrFail($validated['tour_package_id']);
        
        $this->validateCapacity($package, count($validated['travelers']));

        try {
            DB::beginTransaction();

            $baseAmount = $package->price * count($validated['travelers']);
            $discount = $validated['discount_amount'] ?? 0;
            $finalAmount = $baseAmount - $discount;

            $latest = Booking::withTrashed()->orderBy('id', 'desc')->first();
            $nextId = $latest ? $latest->id + 1 : 1;

            $booking = Booking::create([
                'booking_reference' => 'NT-' . date('Y') . '-' . str_pad((string)$nextId, 6, '0', STR_PAD_LEFT),
                'customer_id' => $validated['customer_id'],
                'tour_package_id' => $package->id,
                'booking_date' => $validated['booking_date'],
                'travel_date' => $validated['travel_date'],
                'return_date' => $validated['return_date'] ?? null,
                'number_of_travelers' => count($validated['travelers']),
                'base_amount' => $baseAmount,
                'discount_amount' => $discount,
                'final_amount' => $finalAmount,
                'paid_amount' => 0,
                'balance_amount' => $finalAmount,
                'currency' => $package->currency,
                'booking_status' => BookingStatus::Pending,
                'notes' => $validated['notes'] ?? null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $booking->travelers()->createMany($validated['travelers']);

            DB::commit();
            return redirect()->route('bookings.show', $booking)->with('success', 'Booking created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create booking.']);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        Gate::authorize('view', $booking);

        $booking->load(['customer', 'tourPackage', 'travelers', 'createdBy', 'updatedBy']);

        return Inertia::render('Bookings/Show', [
            'booking' => $booking
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Booking $booking)
    {
        Gate::authorize('update', $booking);

        $booking->load(['travelers']);
        $customers = \App\Models\Customer::select('id', 'first_name', 'last_name', 'email')->orderBy('first_name')->get();
        $packages = TourPackage::select('id', 'name', 'price', 'currency', 'capacity', 'duration_days')->where('status', 'active')->orderBy('name')->get();

        return Inertia::render('Bookings/Edit', [
            'booking' => $booking,
            'customers' => $customers,
            'packages' => $packages,
            'travelerTypes' => array_column(\App\Enums\TravelerType::cases(), 'value'),
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

        // If booking is confirmed, maybe we shouldn't allow changing package or customers, but we can allow traveler updates?
        // Let's restrict core fields if confirmed.
        
        $validated = $request->validated();
        
        if ($booking->booking_status === BookingStatus::Confirmed) {
            // Prevent changing the tour package or customer if confirmed
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
                $discount = $validated['discount_amount'] ?? $booking->discount_amount;
                $finalAmount = $baseAmount - $discount;
                $balanceAmount = $finalAmount - $booking->paid_amount;
                
                $validated['number_of_travelers'] = count($travelers);
                $validated['base_amount'] = $baseAmount;
                $validated['discount_amount'] = $discount;
                $validated['final_amount'] = $finalAmount;
                $validated['balance_amount'] = $balanceAmount;
            } else if (isset($validated['discount_amount'])) {
                $discount = $validated['discount_amount'];
                $finalAmount = $booking->base_amount - $discount;
                $validated['final_amount'] = $finalAmount;
                $validated['balance_amount'] = $finalAmount - $booking->paid_amount;
            }

            $booking->update($validated);

            if ($travelers !== null) {
                $providedIds = collect($travelers)->pluck('id')->filter()->toArray();
                $booking->travelers()->whereNotIn('id', $providedIds)->delete();

                foreach ($travelers as $travelerData) {
                    if (isset($travelerData['id'])) {
                        $booking->travelers()->where('id', $travelerData['id'])->update($travelerData);
                    } else {
                        $booking->travelers()->create($travelerData);
                    }
                }
            }

            DB::commit();
            return redirect()->route('bookings.show', $booking)->with('success', 'Booking updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update booking.']);
        }
    }

    /**
     * Change booking status
     */
    public function changeStatus(Request $request, Booking $booking)
    {
        Gate::authorize('changeStatus', $booking);

        $validated = $request->validate([
            'booking_status' => ['required', \Illuminate\Validation\Rule::enum(BookingStatus::class)]
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

        try {
            DB::beginTransaction();

            if ($newStatus === BookingStatus::Confirmed) {
                // Re-validate capacity just in case of concurrent changes before confirmation
                // Wait, validateCapacity includes Pending, so the capacity is inherently reserved.
                // But we still re-verify the current state.
                $this->validateCapacity($booking->tourPackage, $booking->number_of_travelers, $booking->id);
            }

            if ($newStatus === BookingStatus::Cancelled) {
                Gate::authorize('cancel', $booking);
                // The validateCapacity logic ignores cancelled bookings, so this restores availability implicitly.
            }

            $booking->update([
                'booking_status' => $newStatus,
                'updated_by' => $request->user()->id
            ]);

            DB::commit();
            return back()->with('success', 'Booking status updated to ' . $newStatus->value);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update booking status: ' . $e->getMessage()]);
        }
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
