<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomerRequest;
use App\Http\Requests\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\DocumentType;
use App\Models\SavedFilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Customer::class);

        $perPage = $request->input('per_page', 10);
        $customers = Customer::query()
            ->filterAndSort($request->all())
            ->paginate($perPage)
            ->withQueryString();

        $savedFilters = SavedFilter::where('user_id', $request->user()->id)
            ->where('table_key', 'customers')
            ->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'filters' => $request->all(),
            'savedFilters' => $savedFilters,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Customer::class);

        return Inertia::render('Customers/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCustomerRequest $request)
    {
        Gate::authorize('create', Customer::class);

        $validated = $request->validated();

        // Auto-generate Customer ID (protected from mass-assignment)
        $latestCustomer = Customer::withTrashed()->orderBy('id', 'desc')->first();
        $nextId = $latestCustomer ? $latestCustomer->id + 1 : 1;

        $customer = new Customer($validated);
        $customer->customer_id = 'CUST-'.str_pad($nextId, 5, '0', STR_PAD_LEFT);
        $customer->created_by = $request->user()->id;
        $customer->save();

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'customer' => $customer,
                'message' => 'Customer created successfully.',
            ], 201);
        }

        return redirect()->route('customers.index')->with('success', 'Customer created successfully.');
    }

    /**
     * Search customers for async selection.
     */
    public function search(Request $request)
    {
        Gate::authorize('viewAny', Customer::class);
        $query = $request->input('query', '');

        $customers = Customer::query()
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('first_name', 'like', "%{$query}%")
                        ->orWhere('last_name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('phone', 'like', "%{$query}%")
                        ->orWhere('passport_number', 'like', "%{$query}%")
                        ->orWhere('customer_id', 'like', "%{$query}%");
                });
            })
            ->limit(20)
            ->get(['id', 'customer_id', 'first_name', 'last_name', 'email', 'phone', 'passport_number', 'nationality', 'nic', 'gender', 'dob']);

        return response()->json($customers);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        Gate::authorize('view', $customer);

        // Load documents with their types and uploaders
        $documents = $customer->documents()
            ->with(['documentType', 'uploadedBy:id,name', 'verifiedBy:id,name'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($doc) {
                // Ensure we don't leak the physical storage path to the frontend
                $doc->makeHidden(['storage_path']);

                return $doc;
            });

        $documentTypes = DocumentType::where('is_active', true)->get();

        return Inertia::render('Customers/Show', [
            'customer' => $customer->load('creator:id,name'),
            'documents' => $documents,
            'documentTypes' => $documentTypes,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        Gate::authorize('update', $customer);

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCustomerRequest $request, Customer $customer)
    {
        Gate::authorize('update', $customer);

        $customer->update($request->validated());

        return redirect()->route('customers.index')->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        Gate::authorize('delete', $customer);

        $customer->delete();

        return redirect()->route('customers.index')->with('success', 'Customer deleted successfully.');
    }
}
