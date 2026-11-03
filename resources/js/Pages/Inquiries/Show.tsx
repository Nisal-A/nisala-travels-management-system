// resources/js/Pages/Inquiries/Show.tsx
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PageHeader, StatusBadge } from '@/components/common';
import { useAuth } from '@/hooks/use-auth';
import { Inquiry } from '@/types';
import { CalendarPlus } from 'lucide-react';

interface ShowProps {
    inquiry: Inquiry;
    users?: Array<{ id: number; name: string }>; // staff list for assignment
}

export default function InquiryShow({ inquiry, users = [] }: ShowProps) {
    const { hasRole } = useAuth();
    const canAssign = hasRole('super_admin', 'manager', 'staff');

    const visitorName = inquiry.full_name || inquiry.name || 'Website Visitor';
    const inquiryRef = inquiry.reference || `INQ-${inquiry.id}`;
    const destinationText =
        typeof inquiry.destination === 'object' && inquiry.destination?.name
            ? inquiry.destination.name
            : (typeof inquiry.destination === 'string' && inquiry.destination) || inquiry.destination_slug || '-';

    const travelStart = inquiry.travel_start || inquiry.start_date || inquiry.travel_date;
    const travelEnd = inquiry.travel_end || inquiry.end_date;
    const partySize =
        inquiry.party_size ??
        inquiry.number_of_travelers ??
        ((Number(inquiry.adults || 0) + Number(inquiry.children || 0)) || '-');

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.patch(route('admin.inquiries.status', { inquiry: inquiry.id }), {
            status: e.target.value,
        });
    };

    const handleAssignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.patch(route('admin.inquiries.assign', { inquiry: inquiry.id }), {
            assigned_to: e.target.value || null,
        });
    };

    return (
        <AppLayout title={`Inquiry ${inquiryRef}`}>
            <Head title={`Inquiry ${inquiryRef}`} />
            <div className="space-y-6">
                <PageHeader
                    title={`Inquiry ${inquiryRef}`}
                    badge={<StatusBadge type="inquiry" status={inquiry.status || 'new'} />}
                    description={`Customer inquiry from ${visitorName}`}
                    breadcrumbs={[
                        { label: 'Inquiries', href: route('admin.inquiries.index') },
                        { label: inquiryRef },
                    ]}
                    actions={
                        <div className="flex items-center gap-2.5">
                            {canAssign && (
                                <Link
                                    href={`/bookings/create?inquiry_id=${inquiry.id}`}
                                    className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-[#0E2A47] hover:bg-[#0B3D91] text-white px-3.5 text-xs font-semibold shadow-xs transition-colors"
                                >
                                    <CalendarPlus className="size-4 text-[#F59E0B]" />
                                    <span>Convert to Draft Booking</span>
                                </Link>
                            )}
                        </div>
                    }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-base font-bold">Contact & Trip Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Name
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">{visitorName}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Email / Contact
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {inquiry.email || inquiry.phone || inquiry.contact_information || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Interest
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground capitalize">
                                        {inquiry.interest || inquiry.package_interest || '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Tour
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {inquiry.tour_slug ?? '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Destination
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">{destinationText}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Travel Start
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {travelStart ? new Date(travelStart).toLocaleDateString() : '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Travel End
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {travelEnd ? new Date(travelEnd).toLocaleDateString() : '-'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Party Size
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">{partySize}</dd>
                                </div>
                                <div>
                                    <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                        Received
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium text-foreground">
                                        {inquiry.created_at ? new Date(inquiry.created_at).toLocaleDateString() : '-'}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-base font-bold">Status & Assignment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="inquiry-status"
                                        className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                                    >
                                        Status
                                    </label>
                                    <select
                                        id="inquiry-status"
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                        defaultValue={inquiry.status}
                                        onChange={handleStatusChange}
                                    >
                                        <option value="new">New</option>
                                        <option value="contacted">Contacted</option>
                                        <option value="verified">Verified</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label
                                        htmlFor="inquiry-assigned"
                                        className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold"
                                    >
                                        Assign to
                                    </label>
                                    <select
                                        id="inquiry-assigned"
                                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                                        defaultValue={inquiry.assigned_to ?? ''}
                                        onChange={handleAssignChange}
                                        disabled={!canAssign}
                                    >
                                        <option value="">— Unassigned —</option>
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>
                                                {u.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Message */}
                            <div>
                                <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                                    Client Message
                                </dt>
                                <dd className="mt-1.5 p-3 rounded-lg border border-border bg-muted/30 whitespace-pre-wrap text-sm font-medium text-foreground min-h-[80px]">
                                    {inquiry.message || 'No additional message provided.'}
                                </dd>
                            </div>

                            {/* Consents */}
                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center space-x-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(inquiry.privacy_consent || inquiry.privacy_consent_at)}
                                        readOnly
                                        disabled
                                        className="rounded border-input text-primary"
                                    />
                                    <span>Privacy Consent</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(inquiry.marketing_consent || inquiry.marketing_consent_at)}
                                        readOnly
                                        disabled
                                        className="rounded border-input text-primary"
                                    />
                                    <span>Marketing Consent</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
