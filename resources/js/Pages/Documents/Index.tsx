import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

export default function DocumentsIndex() {
    return (
        <PlaceholderPage
            title="Documents"
            description="Document management — upload, verify, and manage customer travel documents such as passports, visas, and tickets."
            icon={FileText}
            module="NT-Documents"
        />
    );
}
