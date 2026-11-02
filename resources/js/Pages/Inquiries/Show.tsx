// resources/js/Pages/Inquiries/Show.tsx
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader, StatusBadge } from '@/components/common';
import { useAuth } from '@/hooks/use-auth';
import { Inquiry } from '@/types';

interface ShowProps {
  inquiry: Inquiry;
  users: Array<{ id: number; name: string }>; // staff list for assignment
}

export default function InquiryShow({ inquiry, users }: ShowProps) {
  const { hasRole } = useAuth();
  const canAssign = hasRole('super_admin', 'manager', 'staff');

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
    <AppLayout>
      <Head title={`Inquiry ${inquiry.reference}`} />
      <div className="space-y-6">
        <PageHeader
          title={`Inquiry ${inquiry.reference}`}
          description={`Customer inquiry from ${inquiry.full_name}`}
          breadcrumbs={[
            { label: 'Inquiries', href: route('admin.inquiries.index') },
            { label: inquiry.reference },
          ]}
          actions={
            <div className="flex items-center gap-3">
              <StatusBadge type="inquiry" status={inquiry.status} />
              {canAssign && (
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={route('admin.inquiries.edit', { inquiry: inquiry.id })}>
                      Edit Inquiry
                    </Link>
                  }
                />
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
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Name</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{inquiry.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Interest</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground capitalize">{inquiry.interest}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Tour</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{inquiry.tour_slug ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Destination</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{inquiry.destination_slug ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Travel Start</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {inquiry.travel_start ? new Date(inquiry.travel_start).toLocaleDateString() : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Travel End</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {inquiry.travel_end ? new Date(inquiry.travel_end).toLocaleDateString() : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Party Size</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">{inquiry.party_size ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Received</dt>
                  <dd className="mt-1 text-sm font-medium text-foreground">
                    {new Date(inquiry.created_at).toLocaleDateString()}
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
                  <label htmlFor="inquiry-status" className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
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
                  <label htmlFor="inquiry-assigned" className="block text-xs uppercase tracking-wider text-muted-foreground font-semibold">
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
                <dt className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Client Message</dt>
                <dd className="mt-1.5 p-3 rounded-lg border border-border bg-muted/30 whitespace-pre-wrap text-sm font-medium text-foreground min-h-[80px]">
                  {inquiry.message || 'No additional message provided.'}
                </dd>
              </div>

              {/* Consents */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center space-x-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={inquiry.privacy_consent ?? false}
                    readOnly
                    disabled
                    className="rounded border-input text-primary"
                  />
                  <span>Privacy Consent</span>
                </label>
                <label className="flex items-center space-x-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={inquiry.marketing_consent ?? false}
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
