<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\CustomerDocument;
use App\Models\User;
use App\Policies\Concerns\ChecksCustomerOwnership;

/**
 * Authorization policy for CustomerDocument resources.
 *
 * Controls who can view, upload, verify, reject, and delete documents.
 * Customer users can only view/upload documents for their own profile.
 * Verification and rejection are staff-only operations.
 */
class CustomerDocumentPolicy
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
     * Determine whether the user can view a specific document.
     */
    public function view(User $user, CustomerDocument $document): bool
    {
        if ($user->hasAnyRole([UserRole::Manager->value, UserRole::Staff->value])) {
            return true;
        }

        if ($user->hasRole(UserRole::Customer->value)) {
            return $this->isOwner($user, $document->customer_id);
        }

        return false;
    }

    /**
     * Determine whether the user can upload a document for a given customer.
     *
     * When called from a controller, pass the target customer to check ownership.
     */
    public function upload(User $user, \App\Models\Customer $customer): bool
    {
        if ($user->hasAnyRole([UserRole::Manager->value, UserRole::Staff->value])) {
            return true;
        }

        // Customer can upload documents for their own profile
        if ($user->hasRole(UserRole::Customer->value)) {
            return $this->isOwner($user, $customer->id);
        }

        return false;
    }

    /**
     * Determine whether the user can verify a document.
     */
    public function verify(User $user, CustomerDocument $document): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can reject a document.
     */
    public function reject(User $user, CustomerDocument $document): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    /**
     * Determine whether the user can delete a document.
     */
    public function delete(User $user, CustomerDocument $document): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }
}
