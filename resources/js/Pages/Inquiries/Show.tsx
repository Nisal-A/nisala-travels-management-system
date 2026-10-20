// resources/js/Pages/Inquiries/Show.tsx
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { PageHeader } from '@/components/common';
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
      <PageHeader title={`Inquiry ${inquiry.reference}`} description="Detail view for staff" />
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <a href={route('admin.inquiries.index')}><ArrowLeft className="h-4 w-4" /></a>
          </Button>
          {canAssign && (
            <Button variant="outline" size="sm" asChild>
              <a href={route('admin.inquiries.edit', { inquiry: inquiry.id })}>Edit</a>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex items-center gap-2">
              <Badge variant={inquiry.status === 'new' ? 'default' : 'secondary'}>{inquiry.status}</Badge>
              {inquiry.reference}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-sm">{inquiry.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Interest</dt>
                <dd className="mt-1 text-sm">{inquiry.interest}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tour</dt>
                <dd className="mt-1 text-sm">{inquiry.tour_slug ?? '-'} </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Destination</dt>
                <dd className="mt-1 text-sm">{inquiry.destination_slug ?? '-'} </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Travel Start</dt>
                <dd className="mt-1 text-sm">{inquiry.travel_start ? new Date(inquiry.travel_start).toLocaleDateString() : '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Travel End</dt>
                <dd className="mt-1 text-sm">{inquiry.travel_end ? new Date(inquiry.travel_end).toLocaleDateString() : '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Party Size</dt>
                <dd className="mt-1 text-sm">{inquiry.party_size ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Received</dt>
                <dd className="mt-1 text-sm">{new Date(inquiry.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>

            {/* Message */}
            <div className="mt-4">
              <dt className="text-sm font-medium text-muted-foreground">Message</dt>
              <dd className="mt-1 prose max-w-none whitespace-pre-wrap text-sm">{inquiry.message ?? ''}</dd>
            </div>

            {/* Consents */}
            <div className="mt-4 flex gap-4">
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={inquiry.privacy_consent ?? false} readOnly disabled />
                <span className="text-sm">Privacy Consent</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={inquiry.marketing_consent ?? false} readOnly disabled />
                <span className="text-sm">Marketing Consent</span>
              </label>
            </div>

            {/* Status & Assignment */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                <select className="border rounded p-1 w-full" defaultValue={inquiry.status} onChange={handleStatusChange}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="verified">Verified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Assign to</label>
                <select className="border rounded p-1 w-full" defaultValue={inquiry.assigned_to ?? ''} onChange={handleAssignChange} disabled={!canAssign}>
                  <option value="">— Unassigned —</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
