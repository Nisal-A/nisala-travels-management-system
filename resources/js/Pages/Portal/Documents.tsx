import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function PortalDocuments() {
    return (
        <PlaceholderPage
            title="My Documents"
            description="Upload and track your travel documents such as passports and visas. Full document management will be available in a future release."
            icon={FileText}
            module="NT-Portal"
        />
    );
}
