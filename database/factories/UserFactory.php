<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'status' => UserStatus::Active,
        ];
    }

    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    // ------------------------------------------------------------------
    // Status States
    // ------------------------------------------------------------------

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserStatus::Inactive,
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => UserStatus::Suspended,
        ]);
    }

    // ------------------------------------------------------------------
    // Role States (NT-005.1)
    //
    // Each state assigns a Spatie role after user creation. The
    // corresponding Role record must exist in the database (via
    // RoleSeeder or RefreshDatabase + seeding in tests).
    // ------------------------------------------------------------------

    public function superAdmin(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole(UserRole::SuperAdmin->value);
        });
    }

    public function manager(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole(UserRole::Manager->value);
        });
    }

    public function staff(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole(UserRole::Staff->value);
        });
    }

    public function finance(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole(UserRole::Finance->value);
        });
    }

    public function customer(): static
    {
        return $this->afterCreating(function (User $user) {
            $user->assignRole(UserRole::Customer->value);
        });
    }
}
