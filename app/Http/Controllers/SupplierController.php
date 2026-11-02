<?php

namespace App\Http\Controllers;

use App\Enums\SupplierType;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Supplier::class);

        $query = Supplier::query()->filterAndSort($request->all());

        $suppliers = $query->paginate(15)->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => (object) $request->all(),
            'types' => array_map(fn (SupplierType $t) => ['value' => $t->value, 'label' => $t->label()], SupplierType::cases()),
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Supplier::class);

        return Inertia::render('Suppliers/Create', [
            'types' => array_map(fn (SupplierType $t) => ['value' => $t->value, 'label' => $t->label()], SupplierType::cases()),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Supplier::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(SupplierType::class)],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'default_currency' => ['required', 'string', 'max:10'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $supplier = Supplier::create($validated);

        return redirect()->route('suppliers.index')->with('success', "Supplier {$supplier->supplier_code} created successfully.");
    }

    public function edit(Supplier $supplier)
    {
        Gate::authorize('update', $supplier);

        return Inertia::render('Suppliers/Edit', [
            'supplier' => $supplier,
            'types' => array_map(fn (SupplierType $t) => ['value' => $t->value, 'label' => $t->label()], SupplierType::cases()),
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        Gate::authorize('update', $supplier);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(SupplierType::class)],
            'contact_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'default_currency' => ['required', 'string', 'max:10'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')->with('success', "Supplier {$supplier->supplier_code} updated successfully.");
    }

    public function destroy(Supplier $supplier)
    {
        Gate::authorize('delete', $supplier);

        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier deleted successfully.');
    }
}
