<?php

namespace App\Services;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Support\Facades\Notification;

class NotificationRecipients
{
    /**
     * Get the right users by role/permission.
     */
    public static function getStaffByRole(array|string $roles)
    {
        return User::role($roles)->get();
    }

    /**
     * Get the customer's user account by customer_id. 
     * Fallback to on-demand notification via email if no user account exists.
     */
    public static function getCustomer(Customer $customer)
    {
        // Assuming Customer might have a user_id or User has a customer_id, 
        // let's try to find a user by email matching the customer.
        // The instructions: "returns... the customer's user by customer_id. If a customer has no user account, fall back to the customer's email via an on-demand notification."
        $user = User::where('email', $customer->email)->first();
        
        if ($user) {
            return $user;
        }

        return Notification::route('mail', $customer->email);
    }
}
