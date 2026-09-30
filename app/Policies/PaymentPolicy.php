<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Payment;
use App\Models\User;
use App\Policies\Concerns\ChecksCustomerOwnership;

/**
 * Authorization policy for Payment resources.
 *
 * Controls who can list, view, create, and update payments.
 * Finance staff have full operational access to payments.
 * Customer users can only view their own payments.
 */
class PaymentPolicy
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
     * Determine whether the user can view a list of payments.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    /**
     * Determine whether the user can view a specific payment.
     */
    public function view(User $user, Payment $payment): bool
    {
        if ($user->hasAnyRole([UserRole::Manager->value, UserRole::Finance->value])) {
            return true;
        }

        // Customer can view their own payments
        if ($user->hasRole(UserRole::Customer->value)) {
            return $this->isOwner($user, $payment->customer_id);
        }

        return false;
    }

    /**
     * Determine whether the user can create payments.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    /**
     * Determine whether the user can update a payment.
     */
    public function update(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    /**
     * Determine whether the user can delete/void a payment.
     */
    public function delete(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }
}
