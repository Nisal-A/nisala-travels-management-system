import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/common/status-badge';
import { MoneyText } from '@/components/common/money-text';
import { toast } from 'sonner';
import { Booking, Customer, Employee, Payment, PaymentSchedule, BookingNote, ActivityLog } from '@/types';
import {
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    DollarSign,
    MoreHorizontal,
    User,
    MapPin,
    Calendar,
    Users,
    FileText,
    CreditCard,
    MessageSquare,
    Activity,
    Shield,
    Clock,
    Copy,
    ExternalLink,
    AlertCircle,
    UserCheck,
    Send,
    CornerDownRight,
    Printer,
    FileCheck2,
    CalendarClock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TravelerWithDocs {
    id: number;
    full_name: string;
    traveler_type: string;
    passport_number?: string;
    passport_expiry?: string;
    dob?: string;
    gender?: string;
    nationality?: string;
    special_requirements?: string;
    checklist: {
        passport_info: 'valid' | 'expired' | 'missing';
        passport_doc: string;
        visa_doc: string;
    };
}

interface BookingShowProps {
    booking: Booking;
    travelersWithDocs: TravelerWithDocs[];
    activityLogs: ActivityLog[];
    employees: Employee[];
    permissions: {
        canUpdate: boolean;
        canCancel: boolean;
        canChangeStatus: boolean;
        canRecordPayment: boolean;
        canDiscount: boolean;
        canAddNote: boolean;
    };
}

export default function Show({ booking, travelersWithDocs, activityLogs, employees, permissions }: BookingShowProps) {
    const currency = (booking.currency as 'LKR' | 'USD') || 'LKR';
    const statusFormatted = (booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)) as
        'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

    // State for modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToChange, setStatusToChange] = useState<string>('');
    const [statusNote, setStatusNote] = useState<string>('');
    const [statusSubmitting, setStatusSubmitting] = useState(false);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string>(booking.assigned_to?.toString() || '');
    const [assignSubmitting, setAssignSubmitting] = useState(false);

    // Note form state
    const [newNoteContent, setNewNoteContent] = useState('');
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [noteSubmitting, setNoteSubmitting] = useState(false);

    // Payment Form
    const paymentForm = useForm({
        booking_id: booking.id,
        amount: Number(booking.balance_amount || 0) > 0 ? (booking.balance_amount || '').toString() : '',
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: '',
    });

    const handleCopyRef = () => {
        navigator.clipboard.writeText(booking.booking_reference);
        toast.success('Booking reference copied to clipboard');
    };

    // Open status change confirmation modal
    const openStatusConfirmation = (status: string) => {
        setStatusToChange(status);
        setStatusNote('');
        setIsStatusModalOpen(true);
    };

    // Submit status change with note
    const confirmStatusChange = () => {
        setStatusSubmitting(true);
        router.patch(
            route('bookings.status', { booking: booking.id }),
            {
                booking_status: statusToChange,
                note: statusNote,
            },
            {
                onSuccess: () => {
                    setIsStatusModalOpen(false);
                    setStatusSubmitting(false);
                    toast.success(`Booking status changed to ${statusToChange}`);
                },
                onError: (errors) => {
                    setStatusSubmitting(false);
                    toast.error(errors.error || 'Failed to update status');
                },
            },
        );
    };

    // Submit Payment
    const handleRecordPayment = (e: React.FormEvent) => {
        e.preventDefault();
        paymentForm.post(route('payments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setIsPaymentModalOpen(false);
                paymentForm.reset('amount', 'reference_number', 'notes');
                toast.success('Payment recorded successfully');
            },
            onError: (errs) => {
                const msg = errs.amount || errs.error || Object.values(errs)[0] || 'Failed to record payment.';
                toast.error(msg);
            },
        });
    };

    // Submit New Internal Note
    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteContent.trim()) return;

        setNoteSubmitting(true);
        router.post(
            route('bookings.notes.store', { booking: booking.id }),
            {
                content: newNoteContent,
                parent_id: replyingToId,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewNoteContent('');
                    setReplyingToId(null);
                    setNoteSubmitting(false);
                    toast.success('Note added to timeline');
                },
                onError: () => {
                    setNoteSubmitting(false);
                    toast.error('Failed to post note');
                },
            },
        );
    };

    // Submit Staff Assignment
    const handleAssignStaff = (e: React.FormEvent) => {
        e.preventDefault();
        setAssignSubmitting(true);
        router.patch(
            route('bookings.assign', { booking: booking.id }),
            {
                assigned_to: selectedStaffId || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAssignModalOpen(false);
                    setAssignSubmitting(false);
                    toast.success('Staff assigned successfully');
                },
                onError: () => {
                    setAssignSubmitting(false);
                    toast.error('Failed to update staff assignment');
                },
            },
        );
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to archive booking ${booking.booking_reference}?`)) {
            router.delete(route('bookings.destroy', { booking: booking.id }), {
                onSuccess: () => toast.success('Booking archived'),
            });
        }
    };

    // Running Balance Ledger Calculation
    let runningBalance = Number(booking.final_amount);
    const paymentsWithRunningBalance = (booking.payments || []).map((p) => {
        runningBalance -= Number(p.amount);
        return {
            ...p,
            runningBalance: Math.max(0, runningBalance),
        };
    });

    // Next due date calculation
    const unpaidSchedule = (booking.payment_schedules || []).find((s) => s.status !== 'paid');
    const nextDueDate =
        unpaidSchedule?.due_date ||
        (booking.travel_date
            ? new Date(new Date(booking.travel_date).getTime() - 30 * 86400000).toISOString().split('T')[0]
            : null);

    // Lifecycle steps definition
    const lifecycleSteps = [
        {
            key: 'inquiry',
            label: 'Inquiry',
            active: true,
            completed: ['confirmed', 'completed'].includes(booking.booking_status),
        },
        {
            key: 'confirmed',
            label: 'Confirmed',
            active: ['confirmed', 'completed'].includes(booking.booking_status),
            completed: booking.booking_status === 'completed',
        },
        {
            key: 'documents',
            label: 'Documents Ready',
            active: travelersWithDocs.every((t) => t.checklist.passport_info === 'valid'),
            completed: travelersWithDocs.every((t) => t.checklist.passport_info === 'valid'),
        },
        {
            key: 'payment',
            label: 'Fully Paid',
            active: Number(booking.balance_amount) <= 0,
            completed: Number(booking.balance_amount) <= 0,
        },
        {
            key: 'completed',
            label: 'Completed',
            active: booking.booking_status === 'completed',
            completed: booking.booking_status === 'completed',
        },
    ];

    const customerFullName =
        booking.customer?.full_name ||
        `${booking.customer?.first_name || ''} ${booking.customer?.last_name || ''}`.trim();

    return (
        <AppLayout>
            <Head title={`Booking ${booking.booking_reference}`} />

            <div className="space-y-6 pb-12">
                {/* Header: Reference, Customer, StatusBadge, Primary Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono text-foreground flex items-center gap-2">
                                {booking.booking_reference}
                            </h1>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={handleCopyRef}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Copy reference"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                            <StatusBadge
                                type="booking"
                                status={statusFormatted}
                                className="text-sm px-3 py-1 font-semibold"
                            />
                        </div>

                        {/* Customer Link & Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            {booking.customer && (
                                <Link
                                    href={route('customers.show', { customer: booking.customer.id })}
                                    className="flex items-center gap-1.5 font-medium text-primary hover:underline"
                                >
                                    <User className="w-3.5 h-3.5" />
                                    {customerFullName} ({booking.customer.customer_id || 'Client'})
                                    <ExternalLink className="w-3 h-3" />
                                </Link>
                            )}
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> Created on{' '}
                                {new Date(booking.created_at || '').toLocaleDateString()}
                            </span>
                            {booking.tour_package && (
                                <span className="flex items-center gap-1 font-medium text-foreground">
                                    <MapPin className="w-3.5 h-3.5 text-primary" /> {booking.tour_package.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                        {permissions.canRecordPayment && Number(booking.balance_amount) > 0 && (
                            <Button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="gap-2 font-semibold shadow-xs"
                            >
                                <DollarSign className="w-4 h-4" /> Record Payment
                            </Button>
                        )}

                        {permissions.canUpdate && booking.booking_status !== 'cancelled' && (
                            <Link
                                href={route('bookings.edit', { booking: booking.id })}
                                className={buttonVariants({ variant: 'outline', className: 'gap-1.5' })}
                            >
                                <Edit className="w-4 h-4" /> Edit
                            </Link>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button variant="outline" size="icon">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => window.print()} className="gap-2">
                                    <Printer className="w-4 h-4" /> Print Summary
                                </DropdownMenuItem>

                                {permissions.canUpdate && (
                                    <DropdownMenuItem onClick={() => setIsAssignModalOpen(true)} className="gap-2">
                                        <UserCheck className="w-4 h-4" /> Assign Staff Handler
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />

                                {permissions.canCancel && ['pending', 'confirmed'].includes(booking.booking_status) && (
                                    <DropdownMenuItem
                                        onClick={() => openStatusConfirmation('cancelled')}
                                        className="gap-2 text-destructive focus:text-destructive"
                                    >
                                        <XCircle className="w-4 h-4" /> Cancel Booking
                                    </DropdownMenuItem>
                                )}

                                {permissions.canCancel && (
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="gap-2 text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" /> Archive Booking
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Status Stepper with Interactive Transition Actions */}
                <div className="bg-card border rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" /> Booking Lifecycle Progression
                        </h3>

                        {/* Interactive Status Actions Button Group */}
                        {permissions.canChangeStatus && booking.booking_status !== 'cancelled' && (
                            <div className="flex items-center gap-2">
                                {booking.booking_status === 'pending' && (
                                    <Button
                                        size="sm"
                                        onClick={() => openStatusConfirmation('confirmed')}
                                        className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Advance: Confirm Booking
                                    </Button>
                                )}

                                {booking.booking_status === 'confirmed' && (
                                    <Button
                                        size="sm"
                                        onClick={() => openStatusConfirmation('completed')}
                                        className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Advance: Mark as Completed
                                    </Button>
                                )}

                                {permissions.canCancel && ['pending', 'confirmed'].includes(booking.booking_status) && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openStatusConfirmation('cancelled')}
                                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Stepper Visuals */}
                    {booking.booking_status === 'cancelled' ? (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3 text-destructive text-sm font-semibold">
                            <XCircle className="w-5 h-5 shrink-0" />
                            This booking has been cancelled. Tour package seats have been restored.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                            {lifecycleSteps.map((step, idx) => (
                                <div
                                    key={step.key}
                                    className={cn(
                                        'p-3 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1',
                                        step.completed
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                                            : step.active
                                              ? 'bg-primary/10 border-primary/40 text-primary font-semibold ring-1 ring-primary/20'
                                              : 'bg-muted/40 border-border text-muted-foreground opacity-60',
                                    )}
                                >
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-0.5">
                                        {step.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                        ) : (
                                            <span>{idx + 1}</span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium">{step.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main 2-Column Content Layout: Left Tabs (8 cols), Right Sidebar (4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Tabbed Detailed Views */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start overflow-x-auto h-11 p-1 bg-muted/60 border">
                                <TabsTrigger value="overview" className="gap-1.5 text-xs">
                                    <Shield className="w-3.5 h-3.5" /> Overview
                                </TabsTrigger>
                                <TabsTrigger value="travelers" className="gap-1.5 text-xs">
                                    <Users className="w-3.5 h-3.5" /> Travelers ({travelersWithDocs.length})
                                </TabsTrigger>
                                <TabsTrigger value="documents" className="gap-1.5 text-xs">
                                    <FileCheck2 className="w-3.5 h-3.5" /> Documents Checklist
                                </TabsTrigger>
                                <TabsTrigger value="payments" className="gap-1.5 text-xs">
                                    <CreditCard className="w-3.5 h-3.5" /> Payments & Ledger (
                                    {booking.payments?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="notes" className="gap-1.5 text-xs">
                                    <MessageSquare className="w-3.5 h-3.5" /> Notes Timeline (
                                    {booking.booking_notes?.length || 0})
                                </TabsTrigger>
                                <TabsTrigger value="activity" className="gap-1.5 text-xs">
                                    <Activity className="w-3.5 h-3.5" /> Activity
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB 1: OVERVIEW */}
                            <TabsContent value="overview" className="space-y-4 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Tour Package Card */}
                                    <Card className="border-border shadow-xs">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" /> Tour Package Details
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground block">Package Name:</span>
                                                <span className="font-bold text-sm text-foreground">
                                                    {booking.tour_package?.name || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div>
                                                    <span className="text-muted-foreground block">Departure Date:</span>
                                                    <span className="font-semibold">{booking.travel_date}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Return Date:</span>
                                                    <span>{booking.return_date || 'Open return'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Duration:</span>
                                                    <span>
                                                        {booking.tour_package?.duration_days
                                                            ? `${booking.tour_package.duration_days} Days`
                                                            : 'N/A'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">
                                                        Travelers Count:
                                                    </span>
                                                    <span className="font-semibold">{booking.number_of_travelers}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Primary Customer Card */}
                                    <Card className="border-border shadow-xs">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" /> Primary Customer
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground block">Full Name:</span>
                                                <Link
                                                    href={route('customers.show', { customer: booking.customer_id })}
                                                    className="font-bold text-sm text-primary hover:underline flex items-center gap-1"
                                                >
                                                    {customerFullName} <ExternalLink className="w-3 h-3" />
                                                </Link>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-1">
                                                <div>
                                                    <span className="text-muted-foreground block">Email:</span>
                                                    <span>{booking.customer?.email}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Phone:</span>
                                                    <span>{booking.customer?.phone}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Passport:</span>
                                                    <span>{booking.customer?.passport_number || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground block">Nationality:</span>
                                                    <span>{booking.customer?.nationality || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Logistics & Remarks */}
                                <Card className="border-border shadow-xs">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-primary" /> Remarks & Internal Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs">
                                        {booking.notes ? (
                                            <p className="whitespace-pre-line text-foreground bg-muted/30 p-3 rounded-lg border">
                                                {booking.notes}
                                            </p>
                                        ) : (
                                            <p className="text-muted-foreground italic">
                                                No special notes recorded for this booking.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB 2: TRAVELERS */}
                            <TabsContent value="travelers" className="space-y-4 pt-3">
                                <Card className="border-border shadow-xs">
                                    <CardHeader className="p-4 border-b">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-sm font-semibold">
                                                    Registered Passengers ({travelersWithDocs.length})
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    Manifest of all passengers traveling under this booking.
                                                </CardDescription>
                                            </div>
                                            {permissions.canUpdate && (
                                                <Link
                                                    href={route('bookings.edit', { booking: booking.id })}
                                                    className={buttonVariants({
                                                        variant: 'outline',
                                                        size: 'sm',
                                                        className: 'text-xs h-8 gap-1',
                                                    })}
                                                >
                                                    <Edit className="w-3.5 h-3.5" /> Edit Travelers
                                                </Link>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">#</TableHead>
                                                    <TableHead className="text-xs">Full Name</TableHead>
                                                    <TableHead className="text-xs">Category</TableHead>
                                                    <TableHead className="text-xs">Passport No.</TableHead>
                                                    <TableHead className="text-xs">Passport Expiry</TableHead>
                                                    <TableHead className="text-xs">Nationality</TableHead>
                                                    <TableHead className="text-xs">Special Req</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {travelersWithDocs.map((t, idx) => (
                                                    <TableRow key={t.id}>
                                                        <TableCell className="text-xs font-mono">{idx + 1}</TableCell>
                                                        <TableCell className="text-xs font-semibold">
                                                            {t.full_name}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            <Badge variant="outline" className="capitalize text-[10px]">
                                                                {t.traveler_type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-mono">
                                                            {t.passport_number || (
                                                                <span className="text-muted-foreground italic">
                                                                    Missing
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {t.passport_expiry ? (
                                                                t.checklist.passport_info === 'expired' ? (
                                                                    <span className="text-destructive font-semibold flex items-center gap-1">
                                                                        <AlertCircle className="w-3 h-3" /> Expired (
                                                                        {t.passport_expiry})
                                                                    </span>
                                                                ) : (
                                                                    <span>{t.passport_expiry}</span>
                                                                )
                                                            ) : (
                                                                <span className="text-muted-foreground italic">
                                                                    N/A
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {t.nationality || 'Sri Lankan'}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-muted-foreground">
                                                            {t.special_requirements || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB 3: DOCUMENTS CHECKLIST */}
                            <TabsContent value="documents" className="space-y-4 pt-3">
                                <Card className="border-border shadow-xs">
                                    <CardHeader className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <CardTitle className="text-sm font-semibold">
                                                Traveler Document Checklist
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Verification status of passports, visas, and identification per
                                                passenger.
                                            </CardDescription>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={route('documents.index')}
                                                className={buttonVariants({
                                                    variant: 'outline',
                                                    size: 'sm',
                                                    className: 'text-xs h-8 gap-1.5',
                                                })}
                                            >
                                                <ExternalLink className="w-3.5 h-3.5" /> Verification Queue
                                            </Link>
                                            {booking.customer && (
                                                <Link
                                                    href={route('customers.show', { customer: booking.customer.id })}
                                                    className={buttonVariants({
                                                        variant: 'secondary',
                                                        size: 'sm',
                                                        className: 'text-xs h-8 gap-1.5',
                                                    })}
                                                >
                                                    Upload Document
                                                </Link>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">Passenger</TableHead>
                                                    <TableHead className="text-xs">Passport Data</TableHead>
                                                    <TableHead className="text-xs">Passport Scanned Copy</TableHead>
                                                    <TableHead className="text-xs">Visa / Entry Permit</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {travelersWithDocs.map((t) => (
                                                    <TableRow key={t.id}>
                                                        <TableCell className="text-xs font-semibold">
                                                            {t.full_name}
                                                            <span className="block text-[10px] text-muted-foreground capitalize font-normal">
                                                                {t.traveler_type}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {t.checklist.passport_info === 'valid' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                                                                >
                                                                    Valid ({t.passport_number})
                                                                </Badge>
                                                            ) : t.checklist.passport_info === 'expired' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]"
                                                                >
                                                                    Expired
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                                                                >
                                                                    Missing Passport No
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {t.checklist.passport_doc === 'verified' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                                                                >
                                                                    Verified
                                                                </Badge>
                                                            ) : t.checklist.passport_doc === 'pending' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                                                                >
                                                                    Pending Review
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-muted text-muted-foreground text-[10px]"
                                                                >
                                                                    Not Uploaded
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {t.checklist.visa_doc === 'verified' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                                                                >
                                                                    Verified
                                                                </Badge>
                                                            ) : t.checklist.visa_doc === 'pending' ? (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                                                                >
                                                                    Pending
                                                                </Badge>
                                                            ) : (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-muted text-muted-foreground text-[10px]"
                                                                >
                                                                    Not Required / Missing
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB 4: PAYMENTS & FINANCIAL LEDGER */}
                            <TabsContent value="payments" className="space-y-5 pt-3">
                                {/* Running Balance Ledger Table */}
                                <Card className="border-border shadow-xs">
                                    <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm font-semibold">
                                                Financial Ledger & Transactions
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Running balance calculation for booking payments.
                                            </CardDescription>
                                        </div>
                                        {permissions.canRecordPayment && Number(booking.balance_amount) > 0 && (
                                            <Button
                                                size="sm"
                                                onClick={() => setIsPaymentModalOpen(true)}
                                                className="text-xs h-8 gap-1.5"
                                            >
                                                <DollarSign className="w-3.5 h-3.5" /> Record Payment
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">Date</TableHead>
                                                    <TableHead className="text-xs">Receipt / Ref</TableHead>
                                                    <TableHead className="text-xs">Method</TableHead>
                                                    <TableHead className="text-xs text-right">Amount</TableHead>
                                                    <TableHead className="text-xs text-right">
                                                        Running Balance
                                                    </TableHead>
                                                    <TableHead className="text-xs">Recorded By</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {paymentsWithRunningBalance.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={6}
                                                            className="text-center py-6 text-xs text-muted-foreground"
                                                        >
                                                            No payments recorded yet. Remaining balance:{' '}
                                                            <MoneyText
                                                                amount={Number(booking.balance_amount)}
                                                                currency={currency}
                                                                weight="bold"
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    paymentsWithRunningBalance.map((p) => (
                                                        <TableRow key={p.id}>
                                                            <TableCell className="text-xs">{p.payment_date}</TableCell>
                                                            <TableCell className="text-xs font-mono font-medium">
                                                                {p.receipt_number ||
                                                                    p.reference_number ||
                                                                    `PMT-${p.id}`}
                                                            </TableCell>
                                                            <TableCell className="text-xs uppercase font-medium">
                                                                {p.payment_method}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-right font-semibold text-emerald-600">
                                                                +
                                                                <MoneyText
                                                                    amount={Number(p.amount)}
                                                                    currency={currency}
                                                                    size="sm"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-xs text-right font-mono font-bold text-foreground">
                                                                <MoneyText
                                                                    amount={p.runningBalance}
                                                                    currency={currency}
                                                                    size="sm"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-xs text-muted-foreground">
                                                                {p.recordedBy?.name || p.recorded_by?.name || 'Staff'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>

                                {/* Installment Schedule Milestones */}
                                <Card className="border-border shadow-xs">
                                    <CardHeader className="p-4 border-b">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <CalendarClock className="w-4 h-4 text-primary" /> Installment Milestones
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs">Milestone</TableHead>
                                                    <TableHead className="text-xs">Due Date</TableHead>
                                                    <TableHead className="text-xs text-right">
                                                        Scheduled Amount
                                                    </TableHead>
                                                    <TableHead className="text-xs text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {(booking.payment_schedules || []).length === 0 ? (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={4}
                                                            className="text-center py-4 text-xs text-muted-foreground"
                                                        >
                                                            No custom installment schedule registered.
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    (booking.payment_schedules || []).map((s) => (
                                                        <TableRow key={s.id}>
                                                            <TableCell className="text-xs font-medium">
                                                                {s.description}
                                                            </TableCell>
                                                            <TableCell className="text-xs">{s.due_date}</TableCell>
                                                            <TableCell className="text-xs text-right font-semibold">
                                                                <MoneyText
                                                                    amount={Number(s.amount)}
                                                                    currency={currency}
                                                                    size="sm"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-xs text-right">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        'capitalize text-[10px]',
                                                                        s.status === 'paid' &&
                                                                            'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
                                                                        s.status === 'overdue' &&
                                                                            'bg-destructive/10 text-destructive border-destructive/30',
                                                                        s.status === 'unpaid' &&
                                                                            'bg-amber-500/10 text-amber-600 border-amber-500/30',
                                                                    )}
                                                                >
                                                                    {s.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB 5: NOTES TIMELINE */}
                            <TabsContent value="notes" className="space-y-5 pt-3">
                                {/* New Note Form */}
                                {permissions.canAddNote && (
                                    <Card className="border-border shadow-xs">
                                        <form onSubmit={handleAddNote} className="p-4 space-y-3">
                                            {replyingToId && (
                                                <div className="flex items-center justify-between p-2 bg-muted/40 rounded text-xs">
                                                    <span className="flex items-center gap-1.5 text-primary font-medium">
                                                        <CornerDownRight className="w-3.5 h-3.5" /> Replying to note #
                                                        {replyingToId}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setReplyingToId(null)}
                                                        className="h-6 text-[10px]"
                                                    >
                                                        Cancel Reply
                                                    </Button>
                                                </div>
                                            )}

                                            <Textarea
                                                value={newNoteContent}
                                                onChange={(e) => setNewNoteContent(e.target.value)}
                                                placeholder="Add an internal operational note, log customer communication, or mention a teammate with @..."
                                                rows={3}
                                                className="text-xs"
                                                required
                                            />

                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-[11px] text-muted-foreground">
                                                    Internal only — visible to office staff and managers.
                                                </span>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={noteSubmitting || !newNoteContent.trim()}
                                                    className="gap-1.5 text-xs h-8"
                                                >
                                                    <Send className="w-3.5 h-3.5" /> Post Note
                                                </Button>
                                            </div>
                                        </form>
                                    </Card>
                                )}

                                {/* Threaded Timeline */}
                                <div className="space-y-3">
                                    {(booking.booking_notes || []).length === 0 ? (
                                        <p className="text-center py-8 text-xs text-muted-foreground italic">
                                            No notes recorded on this booking yet.
                                        </p>
                                    ) : (
                                        (booking.booking_notes || []).map((note) => (
                                            <div
                                                key={note.id}
                                                className="p-4 border rounded-xl bg-card shadow-xs space-y-2.5"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                                            {note.user?.name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <span className="font-semibold text-xs text-foreground">
                                                                {note.user?.name || 'Staff'}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground ml-2">
                                                                {new Date(note.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            'text-[10px] capitalize',
                                                            note.type === 'status_change' &&
                                                                'bg-blue-500/10 text-blue-600 border-blue-500/30',
                                                            note.type === 'system' && 'bg-muted text-muted-foreground',
                                                            note.type === 'note' &&
                                                                'bg-primary/10 text-primary border-primary/30',
                                                        )}
                                                    >
                                                        {note.type.replace('_', ' ')}
                                                    </Badge>
                                                </div>

                                                <p className="text-xs text-foreground whitespace-pre-line pl-9">
                                                    {note.content}
                                                </p>

                                                {permissions.canAddNote && (
                                                    <div className="pl-9 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setReplyingToId(note.id)}
                                                            className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                                                        >
                                                            <CornerDownRight className="w-3 h-3" /> Reply in thread
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Threaded Replies */}
                                                {note.replies && note.replies.length > 0 && (
                                                    <div className="pl-9 pt-2 space-y-2 border-l-2 border-primary/20 ml-3.5 mt-2">
                                                        {note.replies.map((reply) => (
                                                            <div
                                                                key={reply.id}
                                                                className="p-2.5 bg-muted/40 rounded-lg text-xs space-y-1"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span className="font-semibold text-foreground text-[11px]">
                                                                        {reply.user?.name || 'Staff'}
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground">
                                                                        {new Date(reply.created_at).toLocaleTimeString(
                                                                            [],
                                                                            { hour: '2-digit', minute: '2-digit' },
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <p className="text-foreground">{reply.content}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </TabsContent>

                            {/* TAB 6: ACTIVITY AUDIT LOG */}
                            <TabsContent value="activity" className="space-y-4 pt-3">
                                <Card className="border-border shadow-xs">
                                    <CardHeader className="p-4 border-b">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-primary" /> Audit Trail & History
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-4 relative border-l-2 border-border ml-3 pl-4">
                                            {activityLogs.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic">
                                                    No activity logs registered yet.
                                                </p>
                                            ) : (
                                                activityLogs.map((log) => (
                                                    <div key={log.id} className="relative text-xs space-y-1">
                                                        <div className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-foreground">
                                                                {log.description}
                                                            </span>
                                                            <span className="text-[11px] text-muted-foreground">
                                                                {new Date(log.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-muted-foreground block">
                                                            Performed by: {log.causer?.name || 'System'}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right: Sidebar Summary */}
                    <div className="space-y-5">
                        {/* Financial Totals Card */}
                        <Card className="border-border shadow-xs">
                            <CardHeader className="bg-primary/5 border-b p-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-primary" /> Financial Summary
                                    </CardTitle>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            'text-xs capitalize font-medium',
                                            Number(booking.balance_amount) <= 0
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                                : Number(booking.paid_amount) > 0
                                                  ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                                  : 'bg-amber-500/10 text-amber-600 border-amber-500/30',
                                        )}
                                    >
                                        {booking.payment_status ||
                                            (Number(booking.balance_amount) <= 0 ? 'Paid' : 'Unpaid')}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3 text-xs">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span>Base Package Rate:</span>
                                    <MoneyText
                                        amount={Number(booking.base_amount || 0)}
                                        currency={currency}
                                        size="sm"
                                    />
                                </div>

                                {Number(booking.extras_amount) > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Extras & Add-ons:</span>
                                        <MoneyText
                                            amount={Number(booking.extras_amount)}
                                            currency={currency}
                                            size="sm"
                                        />
                                    </div>
                                )}

                                {Number(booking.tax_amount) > 0 && (
                                    <div className="flex justify-between items-center text-muted-foreground">
                                        <span>Taxes:</span>
                                        <MoneyText amount={Number(booking.tax_amount)} currency={currency} size="sm" />
                                    </div>
                                )}

                                {Number(booking.discount_amount) > 0 && (
                                    <div className="flex justify-between items-center text-emerald-600 font-medium">
                                        <span>Authorized Discount:</span>
                                        <span>
                                            -
                                            <MoneyText
                                                amount={Number(booking.discount_amount)}
                                                currency={currency}
                                                size="sm"
                                                className="text-emerald-600"
                                            />
                                        </span>
                                    </div>
                                )}

                                <div className="border-t pt-2 flex justify-between items-baseline font-bold text-sm">
                                    <span>Final Total:</span>
                                    <MoneyText
                                        amount={Number(booking.final_amount)}
                                        currency={currency}
                                        size="lg"
                                        weight="bold"
                                        className="text-foreground"
                                    />
                                </div>

                                <div className="pt-2 border-t space-y-2">
                                    <div className="flex justify-between items-center text-emerald-600 font-semibold">
                                        <span>Total Paid:</span>
                                        <MoneyText
                                            amount={Number(booking.paid_amount || 0)}
                                            currency={currency}
                                            size="sm"
                                        />
                                    </div>

                                    <div className="flex justify-between items-baseline">
                                        <span className="font-bold text-foreground">Remaining Balance:</span>
                                        <MoneyText
                                            amount={Number(booking.balance_amount)}
                                            currency={currency}
                                            size="xl"
                                            weight="bold"
                                            className={cn(
                                                Number(booking.balance_amount) <= 0
                                                    ? 'text-emerald-600'
                                                    : 'text-destructive font-mono',
                                            )}
                                        />
                                    </div>

                                    {/* Progress bar */}
                                    <div className="w-full bg-muted h-2 rounded-full overflow-hidden mt-1">
                                        <div
                                            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.round(
                                                        (Number(booking.paid_amount || 0) /
                                                            (Number(booking.final_amount) || 1)) *
                                                            100,
                                                    ),
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                {permissions.canRecordPayment && Number(booking.balance_amount) > 0 && (
                                    <Button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="w-full gap-2 mt-2 font-semibold shadow-xs"
                                    >
                                        <DollarSign className="w-4 h-4" /> Record Payment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Next Due Date Card */}
                        <Card className="border-border shadow-xs">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <CalendarClock className="w-4 h-4 text-primary" /> Next Payment Due
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-1 text-xs space-y-1">
                                {Number(booking.balance_amount) <= 0 ? (
                                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Fully Paid — No Pending Dues
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-base font-bold text-foreground">
                                            {nextDueDate || 'Prior to travel'}
                                        </p>
                                        <p className="text-muted-foreground text-[11px]">
                                            Installment amount due:{' '}
                                            <MoneyText
                                                amount={Number(unpaidSchedule?.amount || booking.balance_amount)}
                                                currency={currency}
                                                weight="bold"
                                            />
                                        </p>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Assigned Staff Member Card */}
                        <Card className="border-border shadow-xs">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                    <UserCheck className="w-4 h-4 text-primary" /> Assigned Handler
                                </CardTitle>
                                {permissions.canUpdate && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAssignModalOpen(true)}
                                        className="text-[11px] text-primary hover:underline font-medium"
                                    >
                                        Change
                                    </button>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 pt-1 text-xs">
                                {booking.assignedTo ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                                            {booking.assignedTo.first_name?.[0]}
                                            {booking.assignedTo.last_name?.[0]}
                                        </div>
                                        <div>
                                            <span className="font-bold text-foreground block">
                                                {booking.assignedTo.first_name} {booking.assignedTo.last_name}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {booking.assignedTo.designation || 'Travel Consultant'}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground italic">Unassigned</span>
                                        {permissions.canUpdate && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setIsAssignModalOpen(true)}
                                                className="text-xs h-7"
                                            >
                                                Assign Staff
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* STATUS CHANGE CONFIRMATION MODAL */}
            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Status Change</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to transition booking {booking.booking_reference} to{' '}
                            <strong>{statusToChange.toUpperCase()}</strong>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-2">
                        <Label htmlFor="status_note" className="text-xs font-semibold">
                            Reason / Remarks for Timeline (Optional)
                        </Label>
                        <Textarea
                            id="status_note"
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="e.g. Deposit received, flight tickets issued, client requested cancellation..."
                            rows={3}
                            className="text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground">
                            This entry will be permanently written to the internal notes timeline and audit log.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsStatusModalOpen(false)}
                            disabled={statusSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmStatusChange}
                            disabled={statusSubmitting}
                            className={cn(statusToChange === 'cancelled' && 'bg-destructive hover:bg-destructive/90')}
                        >
                            {statusSubmitting ? 'Updating...' : `Confirm ${statusToChange.toUpperCase()}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* RECORD PAYMENT MODAL */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Record transaction for booking {booking.booking_reference}.
                            <br />
                            Remaining balance:{' '}
                            <strong>
                                <MoneyText amount={Number(booking.balance_amount)} currency={currency} weight="bold" />
                            </strong>
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRecordPayment} className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="amount" className="text-xs font-medium">
                                    Amount ({currency}) *
                                </Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    max={booking.balance_amount}
                                    value={paymentForm.data.amount}
                                    onChange={(e) => paymentForm.setData('amount', e.target.value)}
                                    className="h-10"
                                    required
                                />
                                {paymentForm.errors.amount && (
                                    <p className="text-xs text-destructive">{paymentForm.errors.amount}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="payment_date" className="text-xs font-medium">
                                    Payment Date *
                                </Label>
                                <Input
                                    id="payment_date"
                                    type="date"
                                    value={paymentForm.data.payment_date}
                                    onChange={(e) => paymentForm.setData('payment_date', e.target.value)}
                                    className="h-10"
                                    required
                                />
                                {paymentForm.errors.payment_date && (
                                    <p className="text-xs text-destructive">{paymentForm.errors.payment_date}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="payment_method" className="text-xs font-medium">
                                Payment Method *
                            </Label>
                            <Select
                                value={paymentForm.data.payment_method}
                                onValueChange={(value) => paymentForm.setData('payment_method', value || 'cash')}
                            >
                                <SelectTrigger id="payment_method" className="h-10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cash">Cash</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="credit_card">Credit Card</SelectItem>
                                    <SelectItem value="cheque">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="reference_number" className="text-xs font-medium">
                                Reference / Receipt Number
                            </Label>
                            <Input
                                id="reference_number"
                                value={paymentForm.data.reference_number}
                                onChange={(e) => paymentForm.setData('reference_number', e.target.value)}
                                placeholder="Bank slip # or transaction ID"
                                className="h-10"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="payment_notes" className="text-xs font-medium">
                                Remarks / Notes
                            </Label>
                            <Textarea
                                id="payment_notes"
                                value={paymentForm.data.notes}
                                onChange={(e) => paymentForm.setData('notes', e.target.value)}
                                placeholder="Payment notes..."
                                rows={2}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPaymentModalOpen(false)}
                                disabled={paymentForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={paymentForm.processing}>
                                {paymentForm.processing ? 'Recording...' : 'Record Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* REASSIGN STAFF MODAL */}
            <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Assign Staff Handler</DialogTitle>
                        <DialogDescription>
                            Select the staff member responsible for booking {booking.booking_reference}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAssignStaff} className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="staff_select">Staff Member</Label>
                            <Select
                                value={selectedStaffId || 'unassigned'}
                                onValueChange={(val) => setSelectedStaffId(!val || val === 'unassigned' ? '' : val)}
                            >
                                <SelectTrigger id="staff_select" className="h-10">
                                    <SelectValue placeholder="Choose staff..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.first_name} {emp.last_name}{' '}
                                            {emp.designation ? `(${emp.designation})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAssignModalOpen(false)}
                                disabled={assignSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={assignSubmitting}>
                                {assignSubmitting ? 'Saving...' : 'Update Assignment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
