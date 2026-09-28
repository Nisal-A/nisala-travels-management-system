/**
 * Global TypeScript type definitions for Inertia.js shared data.
 *
 * These types mirror the data structure shared from the Laravel backend
 * via HandleInertiaRequests middleware.
 */

/** Role identifiers matching App\Enums\UserRole */
export type UserRole = 'super_admin' | 'manager' | 'staff' | 'finance' | 'customer';

export interface User {
    id: number;
    name: string;
    email: string;
    status: string;
    roles: UserRole[];
    permissions: string[];
}

/** A single navigation item shared from the backend */
export interface NavigationItem {
    label: string;
    route: string;
    icon: string;
}

/**
 * Navigation groups keyed by section name.
 *
 * - `main`       — Primary operational nav (Dashboard, Customers, etc.)
 * - `management` — Higher-privilege items (Employees, Reports, Settings)
 * - `portal`     — Customer self-service items
 */
export interface NavigationGroups {
    main?: NavigationItem[];
    management?: NavigationItem[];
    portal?: NavigationItem[];
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    navigation: NavigationGroups;
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}
