<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Booking;
use App\Models\User;
use App\Policies\Concerns\ChecksCustomerOwnership;

/**
 * Authorization policy for Booking resources.
 *
 * Controls who can list, view, create, update, and cancel bookings.
 * Finance staff can view bookings (for payment context) but not modify them.
 * Customer users can only view their own bookings.
 */
class BookingPolicy
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
     * Determine whether the user can view a list of bookings.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can view a specific booking.
     */
    public function view(User $user, Booking $booking): bool
    {
        // Office staff and finance can view any booking
        if ($user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
            UserRole::Finance->value,
        ])) {
            return true;
        }

        // Customer can view their own bookings
        if ($user->hasRole(UserRole::Customer->value)) {
            return $this->isOwner($user, $booking->customer_id);
        }

        return false;
    }

    /**
     * Determine whether the user can create bookings.
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can update a booking.
     */
    public function update(User $user, Booking $booking): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can cancel a booking.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }
}
