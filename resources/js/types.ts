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

export interface Customer {
    id: number;
    customer_id?: string;
    first_name?: string;
    last_name?: string;
    full_name: string;
    nic: string | null;
    passport_number: string | null;
    dob: string | null;
    gender: string | null;
    nationality: string | null;
    phone: string;
    whatsapp: string | null;
    email: string;
    address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    status: 'active' | 'inactive';
    notes: string | null;
    created_at?: string;
}

export interface TourPackage {
    id: number;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    capacity?: number;
    duration_days?: number;
}

export interface Traveler {
    id: number;
    booking_id: number;
    full_name: string;
    traveler_type: string;
    dob?: string | null;
    gender?: string | null;
    passport_number?: string | null;
    special_requirements?: string | null;
}

export interface Booking {
    id: number;
    booking_reference: string;
    customer_id: number;
    tour_package_id: number;
    travel_date: string;
    return_date?: string | null;
    number_of_travelers: number;
    base_amount?: string | number;
    discount_amount?: string | number;
    final_amount: string | number;
    balance_amount?: string | number;
    currency: string;
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string | null;
    created_at?: string;
    customer?: Customer;
    tour_package?: TourPackage;
    travelers?: Traveler[];
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page?: number;
    last_page?: number;
    from?: number;
    to?: number;
    total?: number;
}
