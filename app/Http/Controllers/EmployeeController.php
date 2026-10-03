<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles')->whereHas('roles', function ($q) {
            $q->whereIn('name', ['super_admin', 'manager', 'staff', 'finance']);
        });

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('role')) {
            $role = $request->input('role');
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $allowedSortFields = ['name', 'email', 'created_at', 'status'];

        if (in_array($sortField, $allowedSortFields)) {
            $query->orderBy($sortField, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $employees = $query->paginate(10)->withQueryString();

        $roles = Role::whereIn('name', ['super_admin', 'manager', 'staff', 'finance'])->get();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'roles' => $roles,
            'filters' => (object) $request->only(['search', 'status', 'role', 'sort', 'direction']),
        ]);
    }

    public function create()
    {
        $roles = Role::whereIn('name', ['super_admin', 'manager', 'staff', 'finance'])->get();

        return Inertia::render('Employees/Create', ['roles' => $roles]);
    }

    public function store(StoreEmployeeRequest $request)
    {
        $validated = $request->validated();

        $employee = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'] ?? 'active',
        ]);

        $employee->assignRole($validated['role']);

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    public function edit(User $employee)
    {
        $roles = Role::whereIn('name', ['super_admin', 'manager', 'staff', 'finance'])->get();
        $employee->load('roles');

        return Inertia::render('Employees/Edit', [
            'employee' => $employee,
            'roles' => $roles,
        ]);
    }

    public function update(UpdateEmployeeRequest $request, User $employee)
    {
        $validated = $request->validated();

        $employee->name = $validated['name'];
        $employee->email = $validated['email'];
        $employee->status = $validated['status'];

        if (! empty($validated['password'])) {
            $employee->password = Hash::make($validated['password']);
        }

        $employee->save();

        if (isset($validated['role'])) {
            $employee->syncRoles([$validated['role']]);
        }

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    public function destroy(User $employee)
    {
        if (auth()->id() === $employee->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Employee removed successfully.');
    }
}
