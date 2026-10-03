import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/components/layouts/AppLayout';
import { PageHeader, EmptyState } from '@/components/common';
import { FileText, Construction } from 'lucide-react';

export default function DocumentsIndex() {
    return (
        <AppLayout>
            <Head title="Documents" />
            <PageHeader
                title="Documents"
                description="Document management — upload, verify, and manage customer travel documents such as passports, visas, and tickets."
            />

            <EmptyState
                icon={Construction}
                title="Under Construction"
                description="The global document management dashboard is currently being built. You can still manage documents within individual customer profiles."
            />
        </AppLayout>
    );
}
