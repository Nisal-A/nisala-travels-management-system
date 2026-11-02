<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Supplier;
use App\Models\User;

class SupplierPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole(UserRole::SuperAdmin->value)) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function view(User $user, Supplier $supplier): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function update(User $user, Supplier $supplier): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function delete(User $user, Supplier $supplier): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }
}
