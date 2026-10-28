import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MoneyText, ConfirmDialog, EmptyState } from '@/components/common';
import { Plus, Trash2, Edit, DollarSign, Calculator, Calendar, Building2 } from 'lucide-react';
import { PackageCostLine, SupplierType } from '@/types';

interface CostLinesProps {
    tourId?: number;
    initialCostLines?: PackageCostLine[];
    suppliers?: { id: number; name: string; supplier_code: string; default_currency?: string }[];
}

const CATEGORIES: { value: SupplierType; label: string }[] = [
    { value: 'hotel', label: 'Hotel' },
    { value: 'transport', label: 'Transport' },
    { value: 'guide', label: 'Guide' },
    { value: 'air_ticket', label: 'Air Ticket' },
    { value: 'food', label: 'Food' },
    { value: 'other', label: 'Other' },
];

export default function CostLines({ tourId, initialCostLines = [], suppliers = [] }: CostLinesProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingLine, setEditingLine] = useState<PackageCostLine | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        category: 'hotel' as SupplierType,
        description: '',
        supplier_id: '' as string,
        amount: '',
        currency: 'LKR',
        incurred_on: new Date().toISOString().split('T')[0],
        paid_on: '',
        notes: '',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFormData({
            category: 'hotel',
            description: '',
            supplier_id: '',
            amount: '',
            currency: 'LKR',
            incurred_on: new Date().toISOString().split('T')[0],
            paid_on: '',
            notes: '',
        });
        setFormErrors({});
    };

    const handleSupplierChange = (supId: string) => {
        const found = suppliers.find((s) => String(s.id) === supId);
        setFormData((prev) => ({
            ...prev,
            supplier_id: supId,
            currency: found?.default_currency || prev.currency,
        }));
    };

    const handleOpenEdit = (line: PackageCostLine) => {
        setEditingLine(line);
        setFormData({
            category: line.category,
            description: line.description,
            supplier_id: line.supplier_id ? String(line.supplier_id) : '',
            amount: String(line.amount),
            currency: line.currency || 'LKR',
            incurred_on: line.incurred_on ? String(line.incurred_on).split('T')[0] : '',
            paid_on: line.paid_on ? String(line.paid_on).split('T')[0] : '',
            notes: line.notes || '',
        });
        setFormErrors({});
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!tourId) return;

        setIsSubmitting(true);
        setFormErrors({});

        const payload = {
            tour_package_id: tourId,
            category: formData.category,
            description: formData.description,
            supplier_id: formData.supplier_id ? Number(formData.supplier_id) : null,
            amount: formData.amount,
            currency: formData.currency,
            incurred_on: formData.incurred_on,
            paid_on: formData.paid_on || null,
            notes: formData.notes || null,
        };

        if (editingLine) {
            router.put(route('package-cost-lines.update', editingLine.id), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingLine(null);
                    resetForm();
                },
                onError: (err) => setFormErrors(err),
                onFinish: () => setIsSubmitting(false),
            });
        } else {
            router.post(route('package-cost-lines.store'), payload, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAddOpen(false);
                    resetForm();
                },
                onError: (err) => setFormErrors(err),
                onFinish: () => setIsSubmitting(false),
            });
        }
    };

    const handleDelete = () => {
        if (!deleteId) return;
        setIsSubmitting(true);
        router.delete(route('package-cost-lines.destroy', deleteId), {
            preserveScroll: true,
            onSuccess: () => setDeleteId(null),
            onFinish: () => setIsSubmitting(false),
        });
    };

    // Calculate total departure costs in LKR
    const totalLkr = initialCostLines.reduce((acc, line) => {
        return acc + Number(line.amount_lkr || 0);
    }, 0);

    return (
        <Card className="border-border">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <CardTitle>Costs</CardTitle>
                    </div>
                    <CardDescription>
                        Operational cost lines for this tour package departure. Visible to Super Admin, Manager, and Finance.
                    </CardDescription>
                </div>
                {tourId && (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-muted-foreground">Total Departure Cost</div>
                            <div className="text-lg font-bold text-foreground">
                                <MoneyText amount={totalLkr} currency="LKR" />
                            </div>
                        </div>
                        <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger
                                render={
                                    <Button type="button" size="sm" className="shrink-0">
                                        <Plus className="mr-1.5 h-4 w-4" /> Add Cost Line
                                    </Button>
                                }
                            />
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Departure Cost Line</DialogTitle>
                                    <DialogDescription>
                                        Record an incurred operational cost for this tour package.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSave} className="space-y-4 pt-2">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="category">Category *</Label>
                                            <Select
                                                value={formData.category}
                                                onValueChange={(val) => setFormData((p) => ({ ...p, category: val as SupplierType }))}
                                            >
                                                <SelectTrigger id="category" className="w-full">
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map((c) => (
                                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.category && <p className="text-xs text-destructive">{formErrors.category}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="supplier_id">Supplier</Label>
                                            <Select
                                                value={formData.supplier_id || '__none__'}
                                                onValueChange={(val) => handleSupplierChange(val === '__none__' ? '' : val)}
                                            >
                                                <SelectTrigger id="supplier_id" className="w-full">
                                                    <SelectValue placeholder="Optional" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="__none__">None / Direct</SelectItem>
                                                    {suppliers.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>
                                                            {s.name} ({s.supplier_code})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {formErrors.supplier_id && <p className="text-xs text-destructive">{formErrors.supplier_id}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="description">Description *</Label>
                                        <Input
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                            placeholder="e.g. 4-night accommodation booking"
                                            required
                                        />
                                        {formErrors.description && <p className="text-xs text-destructive">{formErrors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="amount">Amount *</Label>
                                            <Input
                                                id="amount"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.amount}
                                                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                                                placeholder="0.00"
                                                required
                                            />
                                            {formErrors.amount && <p className="text-xs text-destructive">{formErrors.amount}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="currency">Currency *</Label>
                                            <Select
                                                value={formData.currency}
                                                onValueChange={(val) => setFormData((p) => ({ ...p, currency: val }))}
                                            >
                                                <SelectTrigger id="currency" className="w-full">
                                                    <SelectValue placeholder="Currency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="LKR">LKR</SelectItem>
                                                    <SelectItem value="USD">USD</SelectItem>
                                                    <SelectItem value="INR">INR</SelectItem>
                                                    <SelectItem value="THB">THB</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {formErrors.currency && <p className="text-xs text-destructive">{formErrors.currency}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="incurred_on">Incurred On *</Label>
                                            <Input
                                                id="incurred_on"
                                                type="date"
                                                value={formData.incurred_on}
                                                onChange={(e) => setFormData((p) => ({ ...p, incurred_on: e.target.value }))}
                                                required
                                            />
                                            {formErrors.incurred_on && <p className="text-xs text-destructive">{formErrors.incurred_on}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="paid_on">Paid On (Optional)</Label>
                                            <Input
                                                id="paid_on"
                                                type="date"
                                                value={formData.paid_on}
                                                onChange={(e) => setFormData((p) => ({ ...p, paid_on: e.target.value }))}
                                            />
                                            {formErrors.paid_on && <p className="text-xs text-destructive">{formErrors.paid_on}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea
                                            id="notes"
                                            rows={2}
                                            value={formData.notes}
                                            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                                            placeholder="Invoice number, payment reference, or details..."
                                        />
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? 'Saving...' : 'Add Line'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {!tourId ? (
                    <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground bg-muted/20">
                        <Calculator className="h-8 w-8 mx-auto mb-2 opacity-40 text-primary" />
                        <p className="text-sm font-medium text-foreground">Costs available after package creation</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                            Save this tour package first. You will then be able to record departure costs and assign them to registered suppliers.
                        </p>
                    </div>
                ) : initialCostLines.length === 0 ? (
                    <EmptyState
                        icon={DollarSign}
                        title="No cost lines recorded"
                        description="Track expenses for accommodation, transport, guides, and tickets for this tour departure."
                        actionLabel="Add First Cost Line"
                        onAction={() => setIsAddOpen(true)}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="sm:hidden flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                            <span className="text-xs text-muted-foreground font-medium">Total Departure Cost</span>
                            <span className="text-base font-bold text-foreground">
                                <MoneyText amount={totalLkr} currency="LKR" />
                            </span>
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b">
                                    <tr>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Description</th>
                                        <th className="px-4 py-3">Supplier</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                        <th className="px-4 py-3 text-right">Amount (LKR)</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {initialCostLines.map((line) => (
                                        <tr key={line.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <Badge variant="outline" className="capitalize text-xs font-normal">
                                                    {line.category.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-foreground">{line.description}</div>
                                                {line.notes && (
                                                    <div className="text-xs text-muted-foreground">{line.notes}</div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {line.supplier ? (
                                                    <span className="font-medium">{line.supplier.name}</span>
                                                ) : (
                                                    <span className="text-muted-foreground italic">Direct / None</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                                                {String(line.incurred_on).split('T')[0]}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                                                <MoneyText amount={Number(line.amount)} currency={line.currency as any} />
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-foreground whitespace-nowrap">
                                                <MoneyText amount={Number(line.amount_lkr)} currency="LKR" />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {line.paid_on ? (
                                                    <Badge variant="default" className="text-[10px]">Paid</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-[10px]">Unpaid</Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleOpenEdit(line)}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => setDeleteId(line.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="md:hidden space-y-3">
                            {initialCostLines.map((line) => (
                                <div key={line.id} className="rounded-lg border bg-card p-3 shadow-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="capitalize text-xs font-normal">
                                            {line.category.replace('_', ' ')}
                                        </Badge>
                                        <div className="text-right">
                                            <div className="text-sm font-bold">
                                                <MoneyText amount={Number(line.amount_lkr)} currency="LKR" />
                                            </div>
                                            {line.currency !== 'LKR' && (
                                                <div className="text-xs text-muted-foreground">
                                                    <MoneyText amount={Number(line.amount)} currency={line.currency as any} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-foreground">{line.description}</div>
                                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                                        <span>{line.supplier?.name || 'Direct'}</span>
                                        <span>{String(line.incurred_on).split('T')[0]}</span>
                                    </div>
                                    <div className="flex justify-end gap-1 border-t pt-2 mt-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenEdit(line)}
                                        >
                                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeleteId(line.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={editingLine !== null} onOpenChange={(open) => !open && setEditingLine(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Cost Line</DialogTitle>
                        <DialogDescription>Modify operational cost details.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData((p) => ({ ...p, category: val as SupplierType }))}
                                >
                                    <SelectTrigger id="edit-category" className="w-full">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-supplier_id">Supplier</Label>
                                <Select
                                    value={formData.supplier_id || '__none__'}
                                    onValueChange={(val) => handleSupplierChange(val === '__none__' ? '' : val)}
                                >
                                    <SelectTrigger id="edit-supplier_id" className="w-full">
                                        <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none__">None / Direct</SelectItem>
                                        {suppliers.map((s) => (
                                            <SelectItem key={s.id} value={String(s.id)}>
                                                {s.name} ({s.supplier_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-description">Description *</Label>
                            <Input
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-amount">Amount *</Label>
                                <Input
                                    id="edit-amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.amount}
                                    onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-currency">Currency *</Label>
                                <Select
                                    value={formData.currency}
                                    onValueChange={(val) => setFormData((p) => ({ ...p, currency: val }))}
                                >
                                    <SelectTrigger id="edit-currency" className="w-full">
                                        <SelectValue placeholder="Currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LKR">LKR</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="INR">INR</SelectItem>
                                        <SelectItem value="THB">THB</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-incurred_on">Incurred On *</Label>
                                <Input
                                    id="edit-incurred_on"
                                    type="date"
                                    value={formData.incurred_on}
                                    onChange={(e) => setFormData((p) => ({ ...p, incurred_on: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-paid_on">Paid On</Label>
                                <Input
                                    id="edit-paid_on"
                                    type="date"
                                    value={formData.paid_on}
                                    onChange={(e) => setFormData((p) => ({ ...p, paid_on: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                            />
                        </div>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditingLine(null)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Update Line'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <ConfirmDialog
                open={deleteId !== null}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Remove Cost Line"
                description="Are you sure you want to remove this cost line? This action cannot be undone."
                confirmLabel="Remove"
                isDanger
                isLoading={isSubmitting}
                onConfirm={handleDelete}
            />
        </Card>
    );
}
