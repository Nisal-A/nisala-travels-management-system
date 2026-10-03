<?php

use App\Models\Customer;
use App\Models\User;
use Database\Seeders\RoleSeeder;

/*
|--------------------------------------------------------------------------
| NT-005.4 Protected Route Groups & Role-Based Navigation Tests
|--------------------------------------------------------------------------
|
| Comprehensive tests verifying:
|   - Route accessibility matches the role-based access matrix
|   - Unauthorized roles receive 403 Forbidden
|   - Customers cannot access office URLs
|   - Finance users cannot access operational/admin areas
|   - Staff cannot access financial/admin areas
|   - Navigation shared props are role-aware
|   - Customer portal routes are restricted to customers
|   - All routes still require authentication (guests → login redirect)
|
*/

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->withoutVite();
});

// =========================================================================
// HELPERS
// =========================================================================

/**
 * Create a user with the given role shorthand.
 */
function createUser(string $role): User
{
    $method = match ($role) {
        'super_admin' => 'superAdmin',
        'manager' => 'manager',
        'staff' => 'staff',
        'finance' => 'finance',
        'customer' => 'customer',
    };

    $user = User::factory()->{$method}()->create();

    // Customer role needs a linked Customer record for the EnsureCustomer middleware
    if ($role === 'customer') {
        Customer::factory()->create(['user_id' => $user->id]);
    }

    return $user;
}

// =========================================================================
// DATASET: Full Route-to-Role Access Matrix
// =========================================================================

/*
 * Each entry: [route, [allowed_roles], [denied_roles]]
 */
dataset('route_access_matrix', [
    // Dashboard — all authenticated users
    'dashboard' => ['/dashboard', ['super_admin', 'manager', 'staff', 'finance', 'customer'], []],

    // Notifications — super_admin, manager, staff, finance
    'notifications' => ['/notifications', ['super_admin', 'manager', 'staff', 'finance'], ['customer']],

    // Admin — super_admin only
    'admin' => ['/admin', ['super_admin'], ['manager', 'staff', 'finance', 'customer']],

    // Settings — super_admin only
    'settings' => ['/settings', ['super_admin'], ['manager', 'staff', 'finance', 'customer']],

    // Employees — super_admin, manager
    'employees' => ['/employees', ['super_admin', 'manager'], ['staff', 'finance', 'customer']],

    // Customers — super_admin, manager, staff
    'customers' => ['/customers', ['super_admin', 'manager', 'staff'], ['finance', 'customer']],

    // Documents — super_admin, manager, staff
    'documents' => ['/documents', ['super_admin', 'manager', 'staff'], ['finance', 'customer']],

    // Tours — super_admin, manager, staff
    'tours' => ['/tours', ['super_admin', 'manager', 'staff'], ['finance', 'customer']],

    // Bookings — super_admin, manager, staff
    'bookings' => ['/bookings', ['super_admin', 'manager', 'staff'], ['finance', 'customer']],

    // Payments — super_admin, manager, finance
    'payments' => ['/payments', ['super_admin', 'manager', 'finance'], ['staff', 'customer']],

    // Reports — super_admin, manager, finance
    'reports' => ['/reports', ['super_admin', 'manager', 'finance'], ['staff', 'customer']],

    // Customer Portal — customer only
    'portal' => ['/portal', ['customer'], ['super_admin', 'manager', 'staff', 'finance']],
    'portal.bookings' => ['/portal/bookings', ['customer'], ['super_admin', 'manager', 'staff', 'finance']],
    'portal.documents' => ['/portal/documents', ['customer'], ['super_admin', 'manager', 'staff', 'finance']],
    'portal.payments' => ['/portal/payments', ['customer'], ['super_admin', 'manager', 'staff', 'finance']],
]);

// =========================================================================
// TESTS: Authorized Access (expect 200)
// =========================================================================

test('authorized roles can access their permitted routes', function (string $url, array $allowed, array $denied) {
    foreach ($allowed as $role) {
        $user = createUser($role);

        $response = $this->actingAs($user)->get($url);

        expect($response->status())
            ->toBe(200, "Expected {$role} to access {$url} with 200, got {$response->status()}");
    }
})->with('route_access_matrix');

// =========================================================================
// TESTS: Unauthorized Access (expect 403)
// =========================================================================

test('unauthorized roles receive 403 when accessing restricted routes', function (string $url, array $allowed, array $denied) {
    foreach ($denied as $role) {
        $user = createUser($role);

        $response = $this->actingAs($user)->get($url);

        expect($response->status())
            ->toBe(403, "Expected {$role} to be denied {$url} with 403, got {$response->status()}");
    }
})->with('route_access_matrix');

// =========================================================================
// TESTS: Guest Access (expect redirect to login)
// =========================================================================

dataset('all_protected_routes', [
    ['/dashboard'],
    ['/notifications'],
    ['/admin'],
    ['/settings'],
    ['/employees'],
    ['/customers'],
    ['/documents'],
    ['/tours'],
    ['/bookings'],
    ['/payments'],
    ['/reports'],
    ['/portal'],
    ['/portal/bookings'],
    ['/portal/documents'],
    ['/portal/payments'],
]);

test('guests are redirected to login for all protected routes', function (string $url) {
    $response = $this->get($url);

    $response->assertRedirect('/login');
    $this->assertGuest();
})->with('all_protected_routes');

// =========================================================================
// TESTS: Specific Role Isolation Scenarios
// =========================================================================

test('customer cannot access any office route', function () {
    $customer = createUser('customer');

    $officeRoutes = ['/admin', '/settings', '/employees', '/customers',
        '/documents', '/tours', '/bookings', '/payments', '/reports', '/notifications'];

    foreach ($officeRoutes as $url) {
        $response = $this->actingAs($customer)->get($url);

        expect($response->status())
            ->toBe(403, "Customer should not access {$url}");
    }
});

test('finance user cannot access operational or admin areas', function () {
    $finance = createUser('finance');

    $restrictedRoutes = ['/admin', '/settings', '/employees', '/customers',
        '/documents', '/tours', '/bookings'];

    foreach ($restrictedRoutes as $url) {
        $response = $this->actingAs($finance)->get($url);

        expect($response->status())
            ->toBe(403, "Finance should not access {$url}");
    }
});

test('finance user can access payment and report areas', function () {
    $finance = createUser('finance');

    foreach (['/payments', '/reports'] as $url) {
        $response = $this->actingAs($finance)->get($url);

        expect($response->status())
            ->toBe(200, "Finance should access {$url}");
    }
});

test('staff cannot access admin, employee management, financial areas, or portal', function () {
    $staff = createUser('staff');

    $restrictedRoutes = ['/admin', '/settings', '/employees',
        '/payments', '/reports', '/portal'];

    foreach ($restrictedRoutes as $url) {
        $response = $this->actingAs($staff)->get($url);

        expect($response->status())
            ->toBe(403, "Staff should not access {$url}");
    }
});

test('staff can access operational areas', function () {
    $staff = createUser('staff');

    foreach (['/customers', '/documents', '/tours', '/bookings'] as $url) {
        $response = $this->actingAs($staff)->get($url);

        expect($response->status())
            ->toBe(200, "Staff should access {$url}");
    }
});

test('office roles cannot access customer portal', function () {
    $officeRoles = ['super_admin', 'manager', 'staff', 'finance'];

    foreach ($officeRoles as $role) {
        $user = createUser($role);

        foreach (['/portal', '/portal/bookings', '/portal/documents', '/portal/payments'] as $url) {
            $response = $this->actingAs($user)->get($url);

            expect($response->status())
                ->toBe(403, "{$role} should not access {$url}");
        }
    }
});

// =========================================================================
// TESTS: Navigation Shared Props
// =========================================================================

test('super admin receives all navigation groups', function () {
    $admin = createUser('super_admin');

    $response = $this->actingAs($admin)->get('/dashboard');
    $page = $response->original->getData()['page'];

    $navigation = $page['props']['navigation'];

    // Should have main and management groups
    expect($navigation)->toHaveKey('main');
    expect($navigation)->toHaveKey('management');

    // Main should include operational items
    $mainLabels = array_column($navigation['main'], 'label');
    expect($mainLabels)->toContain('Dashboard');
    expect($mainLabels)->toContain('Customers');
    expect($mainLabels)->toContain('Payments');

    // Management should include Employees, Reports, Settings
    $mgmtLabels = array_column($navigation['management'], 'label');
    expect($mgmtLabels)->toContain('Employees');
    expect($mgmtLabels)->toContain('Reports');
    expect($mgmtLabels)->toContain('Settings');

    // Should NOT have portal
    expect($navigation)->not->toHaveKey('portal');
});

test('finance user navigation excludes operational and admin items', function () {
    $finance = createUser('finance');

    $response = $this->actingAs($finance)->get('/dashboard');
    $page = $response->original->getData()['page'];

    $navigation = $page['props']['navigation'];

    // Main should have Dashboard and Payments but NOT Customers/Bookings/Tours
    $mainLabels = array_column($navigation['main'], 'label');
    expect($mainLabels)->toContain('Dashboard');
    expect($mainLabels)->toContain('Payments');
    expect($mainLabels)->not->toContain('Customers');
    expect($mainLabels)->not->toContain('Bookings');
    expect($mainLabels)->not->toContain('Tours');

    // Management should have Reports but NOT Employees or Settings
    $mgmtLabels = array_column($navigation['management'], 'label');
    expect($mgmtLabels)->toContain('Reports');
    expect($mgmtLabels)->not->toContain('Employees');
    expect($mgmtLabels)->not->toContain('Settings');
});

test('customer navigation shows portal items only', function () {
    $customer = createUser('customer');

    $response = $this->actingAs($customer)->get('/dashboard');
    $page = $response->original->getData()['page'];

    $navigation = $page['props']['navigation'];

    // Should have main (with Dashboard) and portal
    $mainLabels = array_column($navigation['main'], 'label');
    expect($mainLabels)->toContain('Dashboard');
    expect($mainLabels)->not->toContain('Customers');
    expect($mainLabels)->not->toContain('Payments');

    // Should have portal items
    expect($navigation)->toHaveKey('portal');
    $portalLabels = array_column($navigation['portal'], 'label');
    expect($portalLabels)->toContain('My Bookings');
    expect($portalLabels)->toContain('My Documents');
    expect($portalLabels)->toContain('My Payments');

    // Should NOT have management
    expect($navigation)->not->toHaveKey('management');
});

test('staff navigation includes operational items but not financial or admin', function () {
    $staff = createUser('staff');

    $response = $this->actingAs($staff)->get('/dashboard');
    $page = $response->original->getData()['page'];

    $navigation = $page['props']['navigation'];

    $mainLabels = array_column($navigation['main'], 'label');
    expect($mainLabels)->toContain('Customers');
    expect($mainLabels)->toContain('Documents');
    expect($mainLabels)->toContain('Tours');
    expect($mainLabels)->toContain('Bookings');
    expect($mainLabels)->not->toContain('Payments');

    // No management section for staff
    expect($navigation)->not->toHaveKey('management');
});

// =========================================================================
// TESTS: Shared Auth Props Security
// =========================================================================

test('user roles are shared safely via Inertia', function () {
    $admin = createUser('super_admin');

    $response = $this->actingAs($admin)->get('/dashboard');
    $page = $response->original->getData()['page'];

    $authUser = $page['props']['auth']['user'];

    // Should include roles and permissions
    expect($authUser)->toHaveKey('roles');
    expect($authUser)->toHaveKey('permissions');
    expect($authUser['roles'])->toContain('super_admin');

    // Should NOT include sensitive fields
    expect($authUser)->not->toHaveKey('password');
    expect($authUser)->not->toHaveKey('remember_token');
});
