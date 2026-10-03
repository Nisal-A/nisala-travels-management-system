import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
    ArrowLeft,
    Edit,
    Trash2,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import CustomerDocuments from './Partials/CustomerDocuments';

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
    documents: any[];
    documentTypes: any[];
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

            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('customers.index')}
                            className={buttonVariants({ variant: 'outline', size: 'icon' }) + ' h-8 w-8 shrink-0'}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Back</span>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold tracking-tight">{customer.full_name}</h2>
                                <Badge
                                    variant={customer.status === 'active' ? 'default' : 'secondary'}
                                    className={
                                        customer.status === 'active'
                                            ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/20'
                                            : ''
                                    }
                                >
                                    {customer.status}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <span className="font-mono text-sm">{customer.customer_id}</span>
                                <span>&bull;</span>
                                <span className="text-sm">
                                    Added on {new Date(customer.created_at).toLocaleDateString()}
                                </span>
                                {customer.creator && (
                                    <>
                                        <span>&bull;</span>
                                        <span className="text-sm">By {customer.creator.name}</span>
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <Link
                                href={route('customers.edit', { customer: customer.id })}
                                className={buttonVariants({ variant: 'outline' }) + ' gap-2'}
                            >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                            </Link>
                        )}
                        {canDelete && (
                            <Button variant="destructive" className="gap-2" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4" />
                                <span>Archive</span>
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Core Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    Personal Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{customer.full_name}</p>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <CreditCard className="h-3 w-3" /> NIC Number
                                    </p>
                                    <p className="font-medium">
                                        {customer.nic || (
                                            <span className="text-muted-foreground italic">Not provided</span>
                                        )}
                                    </p>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Plane className="h-3 w-3" /> Passport Number
                                    </p>
                                    <p className="font-medium">
                                        {customer.passport_number || (
                                            <span className="text-muted-foreground italic">Not provided</span>
                                        )}
                                    </p>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <Calendar className="h-3 w-3" /> DOB
                                        </p>
                                        <p className="font-medium">
                                            {customer.dob ? new Date(customer.dob).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                            <User className="h-3 w-3" /> Gender
                                        </p>
                                        <p className="font-medium">{customer.gender || '-'}</p>
                                    </div>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Globe className="h-3 w-3" /> Nationality
                                    </p>
                                    <p className="font-medium">{customer.nationality || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary" />
                                    Contact Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Phone className="h-3 w-3" /> Primary Phone
                                    </p>
                                    <p className="font-medium">{customer.phone}</p>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <MessageCircle className="h-3 w-3 text-emerald-500" /> WhatsApp
                                    </p>
                                    <p className="font-medium">{customer.whatsapp || '-'}</p>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Mail className="h-3 w-3" /> Email Address
                                    </p>
                                    <a
                                        href={`mailto:${customer.email}`}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {customer.email}
                                    </a>
                                </div>
                                <Separator className="opacity-50" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <MapPin className="h-3 w-3" /> Address
                                    </p>
                                    <p className="font-medium text-sm leading-relaxed">{customer.address || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Secondary Info & Modules */}
                    <div className="md:col-span-2 space-y-6">
                        {(customer.emergency_contact_name || customer.notes) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {customer.emergency_contact_name && (
                                    <Card>
                                        <CardHeader className="pb-3 border-b border-border/50">
                                            <CardTitle className="text-base">Emergency Contact</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4 space-y-2">
                                            <p className="font-medium">{customer.emergency_contact_name}</p>
                                            <p className="text-muted-foreground flex items-center gap-2">
                                                <Phone className="h-3 w-3" />{' '}
                                                {customer.emergency_contact_phone || 'No phone provided'}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}

                                {customer.notes && (
                                    <Card className={!customer.emergency_contact_name ? 'sm:col-span-2' : ''}>
                                        <CardHeader className="pb-3 border-b border-border/50">
                                            <CardTitle className="text-base">Internal Notes</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                {customer.notes}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Module Placeholders & Active Modules */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold tracking-tight">Customer Activity</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <CustomerDocuments
                                    customerId={customer.id}
                                    documents={documents}
                                    documentTypes={documentTypes}
                                />

                                <Card className="border-dashed bg-muted/10">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <Plane className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-medium">Bookings</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Bookings and travel history module pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-dashed bg-muted/10">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <PaymentIcon className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-medium">Payments</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Payment and invoicing module pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-dashed bg-muted/10">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <Clock className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-medium">Inquiries</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Customer inquiry module pending implementation.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card className="border-dashed bg-muted/10 sm:col-span-2">
                                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                        <FileText className="h-8 w-8 text-muted-foreground/50 mb-3" />
                                        <h4 className="font-medium">Activity & History</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
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
