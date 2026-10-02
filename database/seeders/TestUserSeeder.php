<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('password');

        $users = [
            [
                'email' => 'manager@nisalatravels.lk',
                'name' => 'Manager User',
                'role' => UserRole::Manager->value,
            ],
            [
                'email' => 'staff@nisalatravels.lk',
                'name' => 'Staff User',
                'role' => UserRole::Staff->value,
            ],
            [
                'email' => 'finance@nisalatravels.lk',
                'name' => 'Finance User',
                'role' => UserRole::Finance->value,
            ],
            [
                'email' => 'customer@nisalatravels.lk',
                'name' => 'Customer User',
                'role' => UserRole::Customer->value,
            ],
        ];

        foreach ($users as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => $password,
                    'status' => UserStatus::Active,
                    'email_verified_at' => now(),
                ]
            );

            if (! $user->hasRole($userData['role'])) {
                $user->assignRole($userData['role']);
            }
        }
    }
}
