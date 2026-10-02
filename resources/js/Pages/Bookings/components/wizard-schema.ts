import { z } from 'zod';

export const travelerSchema = z.object({
    id: z.number().optional(),
    full_name: z.string().trim().min(2, 'Traveler full name must be at least 2 characters'),
    traveler_type: z.enum(['adult', 'child', 'infant']),
    passport_number: z.string().optional().nullable(),
    passport_expiry: z.string().optional().nullable(),
    dob: z.string().optional().nullable(),
    gender: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    nic: z.string().optional().nullable(),
    relationship_to_primary: z.string().optional().nullable(),
    contact_information: z.string().optional().nullable(),
    special_requirements: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

export const extraItemSchema = z.object({
    name: z.string().min(1, 'Extra item name required'),
    price: z.number().min(0, 'Price must be positive'),
});

export const paymentScheduleItemSchema = z.object({
    description: z.string().min(1, 'Description required'),
    amount: z.number().min(0, 'Amount must be positive'),
    due_date: z.string().min(1, 'Due date is required'),
});

export const step1Schema = z.object({
    customer_id: z.string().min(1, 'Please select or create a customer'),
});

export const step2Schema = z.object({
    tour_package_id: z.string().min(1, 'Please select a tour package'),
    travel_date: z.string().min(1, 'Travel departure date is required'),
    return_date: z.string().optional().nullable(),
});

export const step3Schema = z.object({
    travelers: z.array(travelerSchema).min(1, 'At least one traveler is required'),
});

export const step4Schema = z.object({
    discount_amount: z.number().min(0, 'Discount cannot be negative'),
    tax_amount: z.number().min(0, 'Tax cannot be negative').optional(),
    extras: z.array(extraItemSchema).optional(),
});

export const step5Schema = z.object({
    deposit_amount: z.number().min(0).optional(),
    record_payment: z.boolean().optional(),
    payment_amount: z.number().min(0).optional(),
    payment_method: z.string().optional(),
    payment_reference: z.string().optional(),
    payment_schedules: z.array(paymentScheduleItemSchema).optional(),
});

export type WizardFormData = {
    customer_id: string;
    tour_package_id: string;
    booking_date: string;
    travel_date: string;
    return_date: string;
    assigned_to: string;
    travelers: Array<{
        id?: number;
        full_name: string;
        traveler_type: 'adult' | 'child' | 'infant';
        passport_number?: string;
        passport_expiry?: string;
        dob?: string;
        gender?: string;
        nationality?: string;
        nic?: string;
        relationship_to_primary?: string;
        contact_information?: string;
        special_requirements?: string;
        notes?: string;
    }>;
    extras: Array<{
        name: string;
        price: number;
    }>;
    tax_amount: number;
    discount_amount: number;
    payment_plan: 'full' | 'deposit_balance' | 'three_part' | 'four_part' | 'custom';
    deposit_amount: number;
    payment_schedules: Array<{
        description: string;
        amount: number;
        due_date: string;
    }>;
    record_payment: boolean;
    payment_amount: number;
    payment_method: string;
    payment_reference: string;
    notes: string;
};
