<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Inquiry;
use App\Models\User;

class InquiryPolicy
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
            UserRole::Staff->value,
        ]);
    }

    public function view(User $user, Inquiry $inquiry): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    public function update(User $user, Inquiry $inquiry): bool
    {
        return $user->hasAnyRole([
            UserRole::Manager->value,
            UserRole::Staff->value,
        ]);
    }

    public function delete(User $user, Inquiry $inquiry): bool
    {
        return $user->hasRole(UserRole::Manager->value);
    }
}

