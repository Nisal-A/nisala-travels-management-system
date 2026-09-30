import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, Download, MoreHorizontal, UploadCloud, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface DocumentType {
    id: number;
    name: string;
    is_required: boolean;
    tracks_expiry: boolean;
}

interface CustomerDocument {
    id: number;
    document_id: string;
    customer_id: number;
    document_type_id: number;
    original_filename: string;
    file_size: number;
    file_extension: string;
    document_status: string;
    verification_status: string;
    rejection_reason: string | null;
    expiry_date: string | null;
    notes: string | null;
    created_at: string;
    document_type: DocumentType;
    uploaded_by?: { id: number; name: string };
    verified_by?: { id: number; name: string };
}

interface CustomerDocumentsProps {
    customerId: number;
    documents: CustomerDocument[];
    documentTypes: DocumentType[];
}

export default function CustomerDocuments({ customerId, documents, documentTypes }: CustomerDocumentsProps) {
    const { hasRole } = useAuth();
    const canUpload = hasRole('super_admin', 'manager', 'staff');
    const canDelete = hasRole('super_admin', 'manager');
    const canVerify = hasRole('super_admin', 'manager', 'staff');
    const canReject = hasRole('super_admin', 'manager', 'staff');

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [rejectDocId, setRejectDocId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionDocId, setActionDocId] = useState<number | null>(null);
    const { data, setData, post, processing, errors, reset, clearErrors, progress } = useForm({
        document_type_id: '',
        file: null as File | null,
        notes: '',
        expiry_date: '',
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('customers.documents.store', { customer: customerId }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsUploadOpen(false);
                reset();
                alert('Document uploaded securely.');
            },
            onError: (err) => {
                console.error(err);
            }
        });
    };

    const handleDownload = (doc: CustomerDocument) => {
        // Direct download approach since it's a file response
        window.open(route('customers.documents.download', { customer: customerId, document: doc.id }), '_blank');
    };

    const handleVerify = (doc: CustomerDocument) => {
        if (confirm('Are you sure you want to verify this document?')) {
            setActionDocId(doc.id);
            router.patch(route('customers.documents.verify', { customer: customerId, document: doc.id }), {}, {
                preserveScroll: true,
                onSuccess: () => alert('Document verified successfully.'),
                onFinish: () => setActionDocId(null),
            });
        }
    };

    const handleReject = () => {
        if (!rejectDocId || !rejectReason.trim()) return;

        setActionDocId(rejectDocId);
        router.patch(route('customers.documents.reject', { customer: customerId, document: rejectDocId }), { reason: rejectReason }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectDocId(null);
                setRejectReason('');
                alert('Document rejected.');
            },
            onFinish: () => setActionDocId(null),
        });
    };

    const isExpired = (dateString: string | null) => {
        if (!dateString) return false;
        return new Date(dateString).getTime() < new Date().getTime();
    };

    const isExpiringSoon = (dateString: string | null) => {
        if (!dateString) return false;
        const diff = new Date(dateString).getTime() - new Date().getTime();
        const days = diff / (1000 * 3600 * 24);
        return days > 0 && days <= 30;
    };

    const formatBytes = (bytes: number, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getVerificationBadge = (status: string) => {
        switch (status) {
            case 'Verified':
                return <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
            case 'Rejected':
                return <Badge variant="destructive" className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-red-500/20"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-amber-500/20"><AlertCircle className="h-3 w-3 mr-1" /> Pending</Badge>;
        }
    };

    return (
        <Card className="col-span-full border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-4 border-b border-border/50">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Customer Documents
                    </CardTitle>
                    <CardDescription>Securely manage passports, visas, and other required documents.</CardDescription>
                </div>
                {canUpload && (
                    <Dialog open={isUploadOpen} onOpenChange={(open: boolean) => {
                        setIsUploadOpen(open);
                        if (!open) { reset(); clearErrors(); }
                    }}>
                        <DialogTrigger render={<Button className="gap-2" />}>
                            <UploadCloud className="h-4 w-4" />
                            Upload Document
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleUpload}>
                                <DialogHeader>
                                    <DialogTitle>Upload Document</DialogTitle>
                                    <DialogDescription>
                                        Upload a new secure document. Accepted formats: PDF, JPG, PNG (Max 10MB).
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="document_type_id" className={errors.document_type_id ? 'text-destructive' : ''}>Document Type *</Label>
                                        <Select
                                            value={data.document_type_id}
                                            onValueChange={(val) => setData('document_type_id', val || '')}
                                        >
                                            <SelectTrigger id="document_type_id" className={errors.document_type_id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.document_type_id && <p className="text-sm text-destructive">{errors.document_type_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file" className={errors.file ? 'text-destructive' : ''}>File *</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                            className={errors.file ? 'border-destructive' : ''}
                                        />
                                        {errors.file && <p className="text-sm text-destructive">{errors.file}</p>}
                                        {data.file && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Selected: {data.file.name} ({formatBytes(data.file.size)})
                                            </p>
                                        )}
                                    </div>

                                    {documentTypes.find(t => t.id.toString() === data.document_type_id)?.tracks_expiry && (
                                        <div className="space-y-2">
                                            <Label htmlFor="expiry_date" className={errors.expiry_date ? 'text-destructive' : ''}>Expiry Date</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                                className={errors.expiry_date ? 'border-destructive' : ''}
                                            />
                                            {errors.expiry_date && <p className="text-sm text-destructive">{errors.expiry_date}</p>}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes (Optional)</Label>
                                        <Input
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Additional information about this document..."
                                            className={errors.notes ? 'border-destructive' : ''}
                                        />
                                        {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)} disabled={processing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing || !data.file || !data.document_type_id}>
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading... {progress && `(${progress.percentage}%)`}
                                            </>
                                        ) : (
                                            'Upload Document'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="p-0">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <h3 className="text-lg font-medium">No documents</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">This customer doesn't have any uploaded documents yet.</p>
                        {canUpload && (
                            <Button variant="outline" onClick={() => setIsUploadOpen(true)}>
                                Upload First Document
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Filename</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Uploaded</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {documents.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2">
                                                {doc.document_type.name}
                                                {doc.document_status === 'superseded' && (
                                                    <Badge variant="outline" className="text-xs font-normal">Superseded</Badge>
                                                )}
                                            </div>
                                            {doc.document_id && <div className="text-xs text-muted-foreground font-mono">{doc.document_id}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 max-w-[200px] truncate" title={doc.original_filename}>
                                                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                <span className="truncate">{doc.original_filename}</span>
                                            </div>
                                            {doc.expiry_date && (
                                                <div className={`text-xs mt-1 ${isExpired(doc.expiry_date) ? 'text-destructive font-medium' : isExpiringSoon(doc.expiry_date) ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                                    {isExpired(doc.expiry_date) ? 'Expired: ' : 'Exp: '}
                                                    {new Date(doc.expiry_date).toLocaleDateString()}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                {getVerificationBadge(doc.verification_status)}
                                                {doc.verification_status === 'Rejected' && doc.rejection_reason && (
                                                    <div className="text-xs text-destructive max-w-[200px] truncate" title={doc.rejection_reason}>
                                                        Reason: {doc.rejection_reason}
                                                    </div>
                                                )}
                                                {doc.verification_status === 'Verified' && doc.verified_by && (
                                                    <div className="text-xs text-muted-foreground">
                                                        by {doc.verified_by.name}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {formatBytes(doc.file_size)}
                                            <div className="text-xs uppercase">{doc.file_extension}</div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(doc.created_at).toLocaleDateString()}
                                            <div className="text-xs">by {doc.uploaded_by?.name || 'System'}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Open menu</span>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleDownload(doc)} className="gap-2 cursor-pointer">
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </DropdownMenuItem>

                                                    {canVerify && doc.verification_status !== 'Verified' && (
                                                        <DropdownMenuItem onClick={() => handleVerify(doc)} disabled={actionDocId === doc.id} className="gap-2 cursor-pointer">
                                                            {actionDocId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                            Verify
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canReject && doc.verification_status !== 'Rejected' && (
                                                        <DropdownMenuItem onClick={() => setRejectDocId(doc.id)} disabled={actionDocId === doc.id} className="gap-2 cursor-pointer text-amber-600 focus:text-amber-600">
                                                            <AlertCircle className="h-4 w-4" />
                                                            Reject
                                                        </DropdownMenuItem>
                                                    )}

                                                    {canDelete && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem disabled className="text-destructive gap-2">
                                                                <XCircle className="h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Reject Dialog */}
            <Dialog open={!!rejectDocId} onOpenChange={(open) => !open && setRejectDocId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Document</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this document. This reason will be visible to other staff and the customer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="reject_reason" className="mb-2 block">Rejection Reason</Label>
                        <Input
                            id="reject_reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Document is blurry, Expired passport, etc."
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDocId(null)} disabled={actionDocId !== null}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim() || actionDocId !== null}>
                            {actionDocId !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Reject Document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
