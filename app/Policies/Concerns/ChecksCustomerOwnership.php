<?php

namespace App\Policies\Concerns;

use App\Models\User;

/**
 * Reusable trait for policies that need to verify customer ownership.
 *
 * Checks whether the authenticated user's linked customer profile
 * matches a given customer_id, preventing IDOR attacks where
 * Customer A tries to access Customer B's resources.
 */
trait ChecksCustomerOwnership
{
    /**
     * Determine if the user owns the resource via their customer profile.
     *
     * @param  User  $user        The authenticated user
     * @param  int   $customerId  The customer_id on the resource being accessed
     */
    protected function isOwner(User $user, int $customerId): bool
    {
        return $user->customer !== null
            && $user->customer->id === $customerId;
    }
}
