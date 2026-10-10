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
    phone?: string | null;
    avatar_url?: string | null;
    status: string;
    roles: UserRole[];
    role?: string;
    role_label?: string;
    permissions: string[];
    created_at?: string;
    updated_at?: string;
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
    id?: number;
    booking_id?: number;
    full_name: string;
    traveler_type: 'adult' | 'child' | 'infant' | string;
    dob?: string | null;
    gender?: string | null;
    nationality?: string | null;
    nic?: string | null;
    passport_number?: string | null;
    passport_expiry?: string | null;
    relationship_to_primary?: string | null;
    contact_information?: string | null;
    special_requirements?: string | null;
    notes?: string | null;
}

export interface PaymentSchedule {
    id: number;
    booking_id: number;
    description: string;
    amount: number | string;
    due_date: string;
    status: 'unpaid' | 'paid' | 'overdue' | string;
    created_at?: string;
}

export interface BookingNote {
    id: number;
    booking_id: number;
    user_id: number;
    parent_id?: number | null;
    content: string;
    type: 'note' | 'status_change' | 'system' | string;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email?: string;
    };
    replies?: BookingNote[];
}

export interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    designation?: string;
}

export interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type: string;
    subject_id: number;
    causer_type?: string;
    causer_id?: number;
    causer?: {
        id: number;
        name: string;
    };
    properties?: Record<string, unknown>;
    created_at: string;
}

export interface Booking {
    id: number;
    booking_reference: string;
    customer_id: number;
    tour_package_id: number;
    assigned_to?: number | null;
    booking_date?: string;
    travel_date: string;
    return_date?: string | null;
    number_of_travelers: number;
    base_amount?: string | number;
    discount_amount?: string | number;
    extras_amount?: string | number;
    tax_amount?: string | number;
    final_amount: string | number;
    paid_amount?: string | number;
    balance_amount?: string | number;
    currency: string;
    booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status?: string;
    notes?: string | null;
    extras?: { name: string; price: number }[];
    created_at?: string;
    customer?: Customer;
    tour_package?: TourPackage;
    travelers?: Traveler[];
    payments?: Payment[];
    payment_schedules?: PaymentSchedule[];
    booking_notes?: BookingNote[];
    assigned_to_user?: Employee;
    assigned_to_employee?: Employee;
    assignedTo?: Employee;
    created_by?: User;
    createdBy?: User;
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

export interface Payment {
    id: number;
    receipt_number?: string;
    reference_number?: string | null;
    booking_id: number;
    amount: string | number;
    currency: string;
    payment_date: string;
    payment_method: string;
    status: string;
    recorded_by?: { id: number; name: string };
    recordedBy?: { id: number; name: string };
    booking?: Booking;
}

export interface DocumentType {
    id: number;
    name: string;
    description?: string;
    is_required: boolean;
}

export interface CustomerDocument {
    id: number;
    customer_id: number;
    document_type_id: number;
    file_path: string;
    file_name: string;
    file_type: string;
    file_size: number;
    status: string;
    expiry_date?: string;
    created_at?: string;
    document_type?: DocumentType;
}
