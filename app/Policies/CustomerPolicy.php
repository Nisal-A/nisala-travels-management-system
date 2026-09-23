<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;
use App\Policies\Concerns\ChecksCustomerOwnership;

/**
 * Authorization policy for Customer resources.
 *
 * Controls who can list, view, create, update, and delete customers.
 * Super Admin access is granted via the before() hook.
 * Customer users can only view their own profile.
 */
class CustomerPolicy
{
    use ChecksCustomerOwnership;

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
     * Determine whether the user can view a list of customers.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can view a specific customer.
     */
    public function view(User $user, Customer $customer): bool
    {
        // Office staff can view any customer
        if ($user->hasAnyRole([UserRole::Manager->value, UserRole::Staff->value])) {
            return true;
        }

        // Customer can view their own profile
        if ($user->hasRole(UserRole::Customer->value)) {
            return $this->isOwner($user, $customer->id);
        }

        return false;
    }

    /**
     * Determine whether the user can create customers.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can update a specific customer.
     */
    public function update(User $user, Customer $customer): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can delete a customer.
     */
    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }
}
