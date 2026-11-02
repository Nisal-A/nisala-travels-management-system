<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Refund;
use App\Models\User;

class RefundPolicy
{
    public function before(User $user, string $ability, $params = null): ?bool
    {
        // Enforce the rule: nobody approves or rejects their own request, not even Super Admin.
        if (in_array($ability, ['approve', 'reject'])) {
            return null;
        }

        if ($user->hasRole(UserRole::SuperAdmin->value)) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::SuperAdmin->value,
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function view(User $user, Refund $refund): bool
    {
        if ($user->hasAnyRole([
            UserRole::SuperAdmin->value,
            UserRole::Manager->value,
            UserRole::Finance->value,
        ])) {
            return true;
        }

        if ($user->hasRole(UserRole::Customer->value) && $user->customer) {
            return $user->customer->id === $refund->customer_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::SuperAdmin->value,
            UserRole::Manager->value,
            UserRole::Finance->value,
        ]);
    }

    public function approve(User $user, Refund $refund): bool
    {
        // Nobody approves their own request
        if ((int) $user->id === (int) $refund->requested_by) {
            return false;
        }

        // Only Manager or Super Admin can approve
        if (! $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value])) {
            return false;
        }

        $statusStr = is_string($refund->status) ? $refund->status : $refund->status->value;

        return $statusStr === 'requested';
    }

    public function reject(User $user, Refund $refund): bool
    {
        // Nobody rejects their own request (or approves)
        if ((int) $user->id === (int) $refund->requested_by) {
            return false;
        }

        // Only Manager or Super Admin can reject
        if (! $user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value])) {
            return false;
        }

        $statusStr = is_string($refund->status) ? $refund->status : $refund->status->value;

        return $statusStr === 'requested';
    }

    public function markPaid(User $user, Refund $refund): bool
    {
        // Finance, Manager or Super Admin can mark an approved refund as paid
        if (! $user->hasAnyRole([
            UserRole::SuperAdmin->value,
            UserRole::Manager->value,
            UserRole::Finance->value,
        ])) {
            return false;
        }

        $statusStr = is_string($refund->status) ? $refund->status : $refund->status->value;

        return $statusStr === 'approved';
    }

    public function delete(User $user, Refund $refund): bool
    {
        return $user->hasAnyRole([
            UserRole::SuperAdmin->value,
            UserRole::Manager->value,
        ]);
    }
}
