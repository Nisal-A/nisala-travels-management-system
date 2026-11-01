import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import {
    User,
    Phone,
    Mail,
    MapPin,
    CreditCard,
    Calendar,
    Globe,
    MessageCircle,
    Clock,
    FileText,
    Plane,
    CreditCard as PaymentIcon,
    Edit,
    Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { PageHeader, StatusBadge } from '@/components/common';
import CustomerDocuments from './Partials/CustomerDocuments';

interface CustomerDocumentItem {
    id: number;
    document_id: string;
    customer_id: number;
    document_type_id: number;
    original_filename: string;
    file_size: number;
    file_extension: string;
    document_status: string;
    verification_status: string;
    rejection_reason: string | null;
    expiry_date: string | null;
    notes: string | null;
    created_at: string;
    document_type: {
        id: number;
        name: string;
        is_required: boolean;
        tracks_expiry: boolean;
    };
}

interface CustomerDocumentTypeItem {
    id: number;
    name: string;
    is_required: boolean;
    tracks_expiry: boolean;
}

interface CustomerShowProps {
    customer: {
        id: number;
        customer_id: string;
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
        created_at: string;
        creator?: {
            id: number;
            name: string;
        };
    };
    documents: CustomerDocumentItem[];
    documentTypes: CustomerDocumentTypeItem[];
}

export default function CustomersShow({ customer, documents, documentTypes }: CustomerShowProps) {
    const { hasRole } = useAuth();
    const canEdit = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(route('customers.destroy', { customer: customer.id }));
        }
    };

    return (
        <AppLayout
            title={`Customer Profile: ${customer.customer_id}`}
            breadcrumbs={[
                { label: 'Dashboard', href: route('dashboard') },
                { label: 'Customers', href: route('customers.index') },
                { label: customer.customer_id },
            ]}
        >
            <Head title={`${customer.full_name} | Customer Profile`} />

            <div className="space-y-6">
                <PageHeader
                    title={customer.full_name}
                    description={`${customer.customer_id} • Added on ${new Date(customer.created_at).toLocaleDateString()}${customer.creator ? ` by ${customer.creator.name}` : ''}`}
                    actions={
                        <div className="flex items-center gap-2">
                            <StatusBadge status={customer.status} />
                            {canEdit && (
                                <Link
                                    href={route('customers.edit', { customer: customer.id })}
                                    className={buttonVariants({ variant: 'outline' }) + ' gap-2'}
                                >
                                    <Edit className="size-4" />
                                    <span>Edit</span>
                                </Link>
                            )}
                            {canDelete && (
                                <Button variant="destructive" className="gap-2" onClick={handleDelete}>
                                    <Trash2 className="size-4" />
                                    <span>Archive</span>
                                </Button>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Core Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border bg-muted/50">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <User className="size-4 text-primary" />
                                    Personal Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                                        Full Name
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block">
                                        {customer.full_name}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <CreditCard className="size-3.5" /> NIC Number
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block">
                                        {customer.nic || <span className="text-muted-foreground italic">Not provided</span>}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Plane className="size-3.5" /> Passport Number
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block">
                                        {customer.passport_number || <span className="text-muted-foreground italic">Not provided</span>}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <Calendar className="size-3.5" /> DOB
                                        </span>
                                        <span className="text-sm font-medium text-foreground mt-0.5 block">
                                            {customer.dob ? new Date(customer.dob).toLocaleDateString() : '—'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <User className="size-3.5" /> Gender
                                        </span>
                                        <span className="text-sm font-medium text-foreground mt-0.5 block">
                                            {customer.gender || '—'}
                                        </span>
                                    </div>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Globe className="size-3.5" /> Nationality
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block">
                                        {customer.nationality || '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border bg-muted/50">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Phone className="size-4 text-primary" />
                                    Contact Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Phone className="size-3.5" /> Primary Phone
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block">
                                        {customer.phone}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <MessageCircle className="size-3.5 text-success" /> WhatsApp
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block">
                                        {customer.whatsapp || '—'}
                                    </span>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Mail className="size-3.5" /> Email Address
                                    </span>
                                    <a
                                        href={`mailto:${customer.email}`}
                                        className="text-sm font-medium text-primary hover:underline mt-0.5 block truncate"
                                    >
                                        {customer.email}
                                    </a>
                                </div>
                                <div className="border-t border-border pt-3">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <MapPin className="size-3.5" /> Address
                                    </span>
                                    <span className="text-sm font-medium text-foreground mt-0.5 block leading-relaxed">
                                        {customer.address || '—'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Secondary Info & Modules */}
                    <div className="lg:col-span-2 space-y-6">
                        {(customer.emergency_contact_name || customer.notes) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {customer.emergency_contact_name && (
                                    <Card className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                                        <CardHeader className="pb-3 border-b border-border bg-muted/50">
                                            <CardTitle className="text-base font-bold">Emergency Contact</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-2">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                                                    Contact Name
                                                </span>
                                                <span className="text-sm font-medium text-foreground mt-0.5 block">
                                                    {customer.emergency_contact_name}
                                                </span>
                                            </div>
                                            <div className="border-t border-border pt-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                                                    Phone
                                                </span>
                                                <span className="text-sm font-medium text-foreground mt-0.5 flex items-center gap-2">
                                                    <Phone className="size-3.5" />
                                                    {customer.emergency_contact_phone || 'No phone provided'}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {customer.notes && (
                                    <Card className={`rounded-xl border border-border bg-card shadow-sm overflow-hidden ${!customer.emergency_contact_name ? 'sm:col-span-2' : ''}`}>
                                        <CardHeader className="pb-3 border-b border-border bg-muted/50">
                                            <CardTitle className="text-base font-bold">Internal Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-6">
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {customer.notes}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Customer Activity Modules */}
                        <div className="space-y-4">
                            <h3 className="text-base font-bold tracking-tight text-foreground">Customer Activity</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CustomerDocuments
                                    customerId={customer.id}
                                    documents={documents as any}
                                    documentTypes={documentTypes as any}
                                />

                                <Card className="rounded-xl border border-dashed border-border bg-muted/10">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <Plane className="size-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-semibold text-sm text-foreground">Bookings</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Bookings and travel history module pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border border-dashed border-border bg-muted/10">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <PaymentIcon className="size-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-semibold text-sm text-foreground">Payments</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Payment and invoicing module pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border border-dashed border-border bg-muted/10">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <Clock className="size-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-semibold text-sm text-foreground">Inquiries</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Customer inquiry module pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="rounded-xl border border-dashed border-border bg-muted/10 sm:col-span-2">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <FileText className="size-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-semibold text-sm text-foreground">Activity & History</h4>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            System audit and customer activity logging pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
