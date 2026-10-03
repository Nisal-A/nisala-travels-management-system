import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { Card, CardContent, StatusBadge, EmptyState, PageHeader } from '@/components/common';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginatedData, CustomerDocument } from '@/types';
import { FileText } from 'lucide-react';

interface Props {
    documents: PaginatedData<CustomerDocument>;
}

export default function PortalDocuments({ documents }: Props) {
    return (
        <AppLayout title="My Documents">
            <Head title="My Documents" />

            <div className="space-y-6">
                <PageHeader
                    title="My Documents"
                    description="Manage your uploaded travel documents like passports and visas."
                />

                <Card>
                    <CardContent className="p-0">
                        {documents.data.length === 0 ? (
                            <EmptyState
                                icon={FileText}
                                title="No documents found"
                                description="You haven't uploaded any documents yet."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document Type</TableHead>
                                            <TableHead>File Name</TableHead>
                                            <TableHead>Upload Date</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents.data.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    {doc.document_type?.name || 'Document'}
                                                </TableCell>
                                                <TableCell>{doc.file_name}</TableCell>
                                                <TableCell>
                                                    {doc.created_at
                                                        ? new Date(doc.created_at).toLocaleDateString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge
                                                        type="document"
                                                        status={
                                                            doc.status === 'pending'
                                                                ? 'Pending Review'
                                                                : ((doc.status.charAt(0).toUpperCase() +
                                                                      doc.status.slice(1)) as
                                                                      | 'Pending Review'
                                                                      | 'Verified'
                                                                      | 'Rejected'
                                                                      | 'Expired')
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
