<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'status' => $request->user()->status,
                    'roles' => $request->user()->getRoleNames(),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'navigation' => fn () => $request->user()
                ? $this->buildNavigation($request->user())
                : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Build role-aware navigation items for the authenticated user.
     *
     * Navigation visibility is a UX convenience only — every route is
     * protected server-side by the 'role' middleware regardless of what
     * appears in the sidebar.
     *
     * @return array<string, array<int, array{label: string, route: string, icon: string}>>
     */
    private function buildNavigation($user): array
    {
        $items = [];

        // ------------------------------------------------------------------
        // Main Navigation — Office & Operational
        // ------------------------------------------------------------------
        $main = [];

        // Dashboard — all authenticated users
        $main[] = [
            'label' => 'Dashboard',
            'route' => 'dashboard',
            'icon' => 'LayoutDashboard',
        ];

        // Notifications — all office users
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value, UserRole::Finance->value])) {
            $main[] = [
                'label' => 'Notifications',
                'route' => 'notifications.index',
                'icon' => 'Bell',
            ];
        }

        // Customers — super_admin, manager, staff
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value])) {
            $main[] = [
                'label' => 'Customers',
                'route' => 'customers.index',
                'icon' => 'Users',
            ];
        }

        // Documents — super_admin, manager, staff
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value])) {
            $main[] = [
                'label' => 'Documents',
                'route' => 'documents.index',
                'icon' => 'FileText',
            ];
        }

        // Tours — super_admin, manager, staff
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value])) {
            $main[] = [
                'label' => 'Tours',
                'route' => 'tours.index',
                'icon' => 'Map',
            ];
        }

        // Bookings — super_admin, manager, staff
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Staff->value])) {
            $main[] = [
                'label' => 'Bookings',
                'route' => 'bookings.index',
                'icon' => 'CalendarCheck',
            ];
        }

        // Payments — super_admin, manager, finance
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value])) {
            $main[] = [
                'label' => 'Payments',
                'route' => 'payments.index',
                'icon' => 'CreditCard',
            ];
        }

        $items['main'] = $main;

        // ------------------------------------------------------------------
        // Management Navigation — Higher privilege areas
        // ------------------------------------------------------------------
        $management = [];

        // Employees — super_admin, manager
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value])) {
            $management[] = [
                'label' => 'Employees',
                'route' => 'employees.index',
                'icon' => 'UserCog',
            ];
        }

        // Reports — super_admin, manager, finance
        if ($user->hasAnyRole([UserRole::SuperAdmin->value, UserRole::Manager->value, UserRole::Finance->value])) {
            $management[] = [
                'label' => 'Reports',
                'route' => 'reports.index',
                'icon' => 'BarChart3',
            ];
        }

        // Settings — super_admin only
        if ($user->hasRole(UserRole::SuperAdmin->value)) {
            $management[] = [
                'label' => 'Settings',
                'route' => 'settings.index',
                'icon' => 'Settings',
            ];
        }

        if (! empty($management)) {
            $items['management'] = $management;
        }

        // ------------------------------------------------------------------
        // Customer Portal Navigation — Customer role only
        // ------------------------------------------------------------------
        if ($user->hasRole(UserRole::Customer->value)) {
            $items['portal'] = [
                [
                    'label' => 'My Bookings',
                    'route' => 'portal.bookings',
                    'icon' => 'CalendarCheck',
                ],
                [
                    'label' => 'My Documents',
                    'route' => 'portal.documents',
                    'icon' => 'FileText',
                ],
                [
                    'label' => 'My Payments',
                    'route' => 'portal.payments',
                    'icon' => 'CreditCard',
                ],
            ];
        }

        return $items;
    }
}
