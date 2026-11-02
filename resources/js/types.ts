
export interface CompanyConfig {
    name: string;
    logo_url?: string;
    brand_color?: string;
    address?: string;
    phone?: string;
    whatsapp_url?: string;
    support_email?: string;
}
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
    auth?: {
        user: User | null;
        unreadNotificationsCount?: number;
    };
    navigation?: NavigationGroups;
    flash?: {
        success: string | null;
        error: string | null;
    };
    company?: CompanyConfig;
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
    document_type?: DocumentType;
}

export type SupplierType = 'hotel' | 'transport' | 'guide' | 'air_ticket' | 'food' | 'other';

export interface Supplier {
    id: number;
    supplier_code: string;
    name: string;
    type: SupplierType;
    contact_name?: string | null;
    phone?: string | null;
    email?: string | null;
    default_currency: string;
    is_active: boolean;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface PackageCostLine {
    id: number;
    tour_package_id: number;
    supplier_id?: number | null;
    category: SupplierType;
    description: string;
    amount: string | number;
    currency: string;
    exchange_rate_to_lkr: string | number;
    amount_lkr: string | number;
    incurred_on: string;
    paid_on?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    supplier?: Supplier;
}

export type RefundStatus = 'requested' | 'approved' | 'rejected' | 'paid';

export interface Refund {
    id: number;
    refund_number: string;
    booking_id: number;
    payment_id?: number | null;
    customer_id: number;
    amount: string | number;
    cancellation_charge: string | number;
    currency: string;
    exchange_rate_to_lkr: string | number;
    amount_lkr: string | number;
    reason: string;
    status: RefundStatus;
    requested_by: number;
    approved_by?: number | null;
    approved_at?: string | null;
    paid_on?: string | null;
    payment_method?: string | null;
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    booking?: Booking;
    customer?: Customer;
    requestedBy?: User;
    approvedBy?: User;
    payment?: Payment;
    activityLogs?: {
        id: number;
        description: string;
        created_at: string;
        causer?: { id: number; name: string };
    }[];
}
