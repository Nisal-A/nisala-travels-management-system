<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EmployeeController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

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

        $employees = $query->paginate(10)->through(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
                'role' => $user->roles->first()?->name ?? 'user',
                'avatar_url' => $user->avatar_url,
                'created_at' => $user->created_at,
            ];
        })->withQueryString();

        $roles = Role::whereIn('name', ['super_admin', 'manager', 'staff', 'finance'])->get();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'roles' => $roles,
            'filters' => (object) $request->only(['search', 'status', 'role', 'sort', 'direction']),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->whereNull('deleted_at')], // Unique including soft-deleted? The prompt says "Email must be unique (including soft-deleted users, with a clear error)". So we remove whereNull.
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:super_admin,manager,staff,finance',
            'status' => 'required|string|in:active,inactive',
        ]);
        
        $request->validate([
            'email' => Rule::unique('users'),
        ], [
            'email.unique' => 'This email address is already in use by an active or deactivated user.',
        ]);

        $employee = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make(Str::random(16)), // Temp password, will use reset link
            'status' => $validated['status'],
        ]);

        $employee->assignRole($validated['role']);
        
        // Send reset password link as invitation
        $token = Password::getRepository()->create($employee);
        $employee->sendPasswordResetNotification($token);

        return redirect()->back()->with('success', 'Employee created and invitation sent successfully.');
    }
    
    public function show(User $employee)
    {
        $this->authorize('view', $employee);
        
        // Ensure it's an employee
        if (!$employee->hasAnyRole(['super_admin', 'manager', 'staff', 'finance'])) {
            abort(404);
        }

        return Inertia::render('Employees/Show', [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->name,
                'email' => $employee->email,
                'phone' => $employee->phone,
                'status' => $employee->status,
                'role' => $employee->roles->first()?->name ?? 'user',
                'avatar_url' => $employee->avatar_url,
                'created_at' => $employee->created_at,
            ]
        ]);
    }

    public function update(Request $request, User $employee)
    {
        $this->authorize('update', $employee);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($employee->id)],
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:super_admin,manager,staff,finance',
            'status' => 'required|string|in:active,inactive',
        ]);
        
        // Check rules
        if ($employee->id === auth()->id()) {
            if ($validated['role'] !== 'super_admin' || $validated['status'] === 'inactive') {
                return back()->with('error', 'You cannot demote or deactivate your own account.');
            }
        }
        
        if ($employee->hasRole('super_admin') && $validated['role'] !== 'super_admin') {
            if (!$this->isNotLastSuperAdmin($employee)) {
                return back()->with('error', 'Cannot perform this action on the last active super administrator.');
            }
        }
        
        if ($employee->hasRole('super_admin') && $validated['status'] === 'inactive' && $employee->status->value === 'active') {
            if (!$this->isNotLastSuperAdmin($employee)) {
                return back()->with('error', 'Cannot perform this action on the last active super administrator.');
            }
        }

        $employee->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
        ]);

        $employee->syncRoles([$validated['role']]);
        
        if ($validated['status'] === 'inactive') {
            $this->invalidateSessions($employee);
        }

        return redirect()->back()->with('success', 'Employee updated successfully.');
    }

    public function destroy(User $employee)
    {
        $this->authorize('delete', $employee);
        
        if ($employee->hasRole('super_admin')) {
            if (!$this->isNotLastSuperAdmin($employee)) {
                return back()->with('error', 'Cannot perform this action on the last active super administrator.');
            }
        }

        $employee->delete();
        $this->invalidateSessions($employee);

        return redirect()->back()->with('success', 'Employee removed successfully.');
    }
    
    public function activate(User $employee)
    {
        $this->authorize('activate', $employee);
        
        $employee->update(['status' => 'active']);
        
        return redirect()->back()->with('success', 'Employee activated successfully.');
    }
    
    public function deactivate(User $employee)
    {
        $this->authorize('deactivate', $employee);
        
        if ($employee->hasRole('super_admin')) {
            if (!$this->isNotLastSuperAdmin($employee)) {
                return back()->with('error', 'Cannot perform this action on the last active super administrator.');
            }
        }
        
        $employee->update(['status' => 'inactive']);
        $this->invalidateSessions($employee);
        
        return redirect()->back()->with('success', 'Employee deactivated successfully.');
    }
    
    public function resetPassword(User $employee)
    {
        $this->authorize('update', $employee);
        
        $token = Password::getRepository()->create($employee);
        $employee->sendPasswordResetNotification($token);
        
        return redirect()->back()->with('success', 'Password reset link sent successfully.');
    }
    
    private function isNotLastSuperAdmin(User $employee): bool
    {
        $superAdminCount = User::whereHas('roles', function($q) {
            $q->where('name', 'super_admin');
        })->where('status', \App\Enums\UserStatus::Active)->where('id', '!=', $employee->id)->count();
        
        return $superAdminCount > 0;
    }
    
    private function invalidateSessions(User $employee)
    {
        DB::table('sessions')->where('user_id', $employee->id)->delete();
    }
}
