// resources/js/Pages/Inquiries/Index.tsx
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit } from 'lucide-react';
import { PageHeader } from '@/components/common';
import { useAuth } from '@/hooks/use-auth';
import { Inquiry, PaginatedData } from '@/types';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ColumnDef } from '@tanstack/react-table';

interface IndexProps {
  inquiries: PaginatedData<Inquiry>;
  filters: Record<string, any>;
  savedFilters?: any[];
}

export default function InquiriesIndex({ inquiries, filters, savedFilters = [] }: IndexProps) {
  const { hasRole } = useAuth();
  const canAssign = hasRole('super_admin', 'manager', 'staff');

  const columns: ColumnDef<Inquiry>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />, 
      cell: ({ row }) => <span className="font-medium text-muted-foreground">{row.getValue('id')}</span>,
    },
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />, 
      cell: ({ row }) => <span>{row.getValue('reference')}</span>,
    },
    {
      accessorKey: 'full_name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />, 
      cell: ({ row }) => <span>{row.getValue('full_name')}</span>,
    },
    {
      accessorKey: 'interest',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Interest" />, 
      cell: ({ row }) => <span>{row.getValue('interest')}</span>,
    },
    {
      accessorKey: 'tour_slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tour" />, 
      cell: ({ row }) => <span>{row.getValue('tour_slug') ?? '-'}</span>,
    },
    {
      accessorKey: 'destination_slug',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Destination" />, 
      cell: ({ row }) => <span>{row.getValue('destination_slug') ?? '-'}</span>,
    },
    {
      accessorKey: 'travel_start',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Travel Start" />, 
      cell: ({ row }) => {
        const d = row.getValue('travel_start') as string | null;
        return d ? new Date(d).toLocaleDateString() : '-';
      },
    },
    {
      accessorKey: 'travel_end',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Travel End" />, 
      cell: ({ row }) => {
        const d = row.getValue('travel_end') as string | null;
        return d ? new Date(d).toLocaleDateString() : '-';
      },
    },
    {
      accessorKey: 'party_size',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Party Size" />, 
      cell: ({ row }) => <span>{row.getValue('party_size') ?? '-'}</span>,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, 
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return <Badge variant={status === 'new' ? 'default' : 'secondary'}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'assigned_to',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Assigned To" />, 
      cell: ({ row }) => <span>{row.getValue('assigned_to') ?? '-'}</span>,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Received" />, 
      cell: ({ row }) => {
        const d = row.getValue('created_at') as string;
        return new Date(d).toLocaleDateString();
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const inquiry = row.original as Inquiry;
        return (
          <div className="text-right space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.visit(route('admin.inquiries.show', { inquiry: inquiry.id }))}>
                  <Eye className="mr-2 h-4 w-4"/> View
                </DropdownMenuItem>
                {canAssign && (
                  <DropdownMenuItem onClick={() => router.visit(route('admin.inquiries.edit', { inquiry: inquiry.id }))}>
                    <Edit className="mr-2 h-4 w-4"/> Edit
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <Head title="Inquiries" />
      <PageHeader title="Inquiries" description="Staff can review and work through public enquiries" />
      <DataTable data={inquiries.data} columns={columns} />
    </AppLayout>
  );
}
