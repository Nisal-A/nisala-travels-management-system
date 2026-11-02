import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, EmptyState } from '@/components/common';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DocumentsIndex() {
    return (
        <AppLayout
            title="Documents"
            breadcrumbs={[{ label: 'Dashboard', href: route('dashboard') }, { label: 'Documents' }]}
        >
            <Head title="Documents" />
            <div className="space-y-6">
                <PageHeader
                    title="Documents"
                    description="Upload, verify, and manage customer travel documents such as passports, visas, and tickets."
                />

                <Card className="p-6">
                    <EmptyState
                        icon={FileText}
                        title="Document Management"
                        description="This module is coming soon. You can still manage documents within individual customer profiles."
                        className="border-none py-8 min-h-[300px]"
                    />
                </Card>
            </div>
        </AppLayout>
    );
}
