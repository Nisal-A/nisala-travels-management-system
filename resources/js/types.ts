/**
 * Global TypeScript type definitions for Inertia.js shared data.
 *
 * These types mirror the data structure shared from the Laravel backend
 * via HandleInertiaRequests middleware.
 */

export interface User {
    id: number;
    name: string;
    email: string;
    status: string;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    [key: string]: unknown;
}
