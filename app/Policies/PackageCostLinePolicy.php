<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\PackageCostLine;
use App\Models\User;

class PackageCostLinePolicy
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

    public function view(User $user, PackageCostLine $costLine): bool
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

    public function update(User $user, PackageCostLine $costLine): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function delete(User $user, PackageCostLine $costLine): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }
}
