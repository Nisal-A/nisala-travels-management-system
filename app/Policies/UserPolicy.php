<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasRole('super_admin') || $user->hasRole('manager');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->hasRole('super_admin') || $user->hasRole('manager');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if (!$user->hasRole('super_admin')) {
            return false;
        }

        // Cannot delete oneself
        if ($user->id === $model->id) {
            return false;
        }

        // Last active super admin check is handled in the controller or here. 
        // Let's do it in the controller for clearer validation error messages, 
        // but returning false here is an extra layer of security.
        return true;
    }

    /**
     * Determine whether the user can change the role of the model.
     */
    public function changeRole(User $user, User $model): bool
    {
        if (!$user->hasRole('super_admin')) {
            return false;
        }

        // Cannot demote oneself
        if ($user->id === $model->id) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can deactivate the model.
     */
    public function deactivate(User $user, User $model): bool
    {
        if (!$user->hasRole('super_admin')) {
            return false;
        }

        // Cannot deactivate oneself
        if ($user->id === $model->id) {
            return false;
        }

        return true;
    }
    
    /**
     * Determine whether the user can activate the model.
     */
    public function activate(User $user, User $model): bool
    {
        return $user->hasRole('super_admin');
    }
}
