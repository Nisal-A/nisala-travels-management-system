<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\TourPackage;
use App\Models\User;

class TourPackagePolicy
{
    /**
     * Super Admin bypasses all checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole(UserRole::SuperAdmin->value)) {
            return true;
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TourPackage $tourPackage): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TourPackage $tourPackage): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }

    /**
     * Determine whether the user can change status.
     */
    public function changeStatus(User $user, TourPackage $tourPackage): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TourPackage $tourPackage): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, TourPackage $tourPackage): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, TourPackage $tourPackage): bool
    {
        return false; // Only Super Admin can force delete (handled by before method)
    }
}
