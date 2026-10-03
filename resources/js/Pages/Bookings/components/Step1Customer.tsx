import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer, Employee } from '@/types';
import CustomerSlideOver from './CustomerSlideOver';
import { Search, UserPlus, Check, User, Mail, Phone, FileText, Globe, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step1CustomerProps {
    customerId: string;
    onSelectCustomer: (customer: Customer) => void;
    assignedToId: string;
    onSelectAssignedTo: (employeeId: string) => void;
    initialCustomers: Customer[];
    employees: Employee[];
    error?: string;
    isEditing?: boolean;
}

export default function Step1Customer({
    customerId,
    onSelectCustomer,
    assignedToId,
    onSelectAssignedTo,
    initialCustomers,
    employees,
    error,
    isEditing = false,
}: Step1CustomerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>(initialCustomers);
    const [searching, setSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Selected customer object
    const selectedCustomer =
        searchResults.find((c) => c.id.toString() === customerId) ||
        initialCustomers.find((c) => c.id.toString() === customerId);

    // Debounced async customer search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults(initialCustomers);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            try {
                const response = await axios.get('/admin/customers/search', {
                    params: { query: searchQuery },
                });
                setSearchResults(response.data || []);
                setIsDropdownOpen(true);
            } catch (err) {
                console.error('Failed to search customers', err);
            } finally {
                setSearching(false);
            }
        }, 250);

        return () => clearTimeout(timer);
    }, [searchQuery, initialCustomers]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (customer: Customer) => {
        onSelectCustomer(customer);
        setIsDropdownOpen(false);
        setSearchQuery('');
    };

    const handleCreatedCustomer = (customer: Customer) => {
        setSearchResults((prev) => [customer, ...prev]);
        onSelectCustomer(customer);
    };

    return (
        <div className="space-y-6">
            <Card className="border-border shadow-xs">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" /> Customer Selection
                            </CardTitle>
                            <CardDescription>
                                Find an existing customer or register a new one to link this booking.
                            </CardDescription>
                        </div>
                        {!isEditing && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsSlideOverOpen(true)}
                                className="gap-2 border-primary text-primary hover:bg-primary/5 self-start sm:self-auto"
                            >
                                <UserPlus className="w-4 h-4" /> Create New Customer
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Async Combobox */}
                    {!selectedCustomer ? (
                        <div className="space-y-2 relative" ref={dropdownRef}>
                            <Label htmlFor="customer_search" className="text-sm font-medium">
                                Search Existing Customer <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="customer_search"
                                    type="text"
                                    placeholder="Type customer name, email, phone, passport, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="pl-9 pr-9 h-11"
                                    autoComplete="off"
                                />
                                {searching && (
                                    <Loader2 className="absolute right-3 top-3.5 h-4 w-4 animate-spin text-muted-foreground" />
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-xl max-h-72 overflow-y-auto divide-y divide-border">
                                    {searchResults.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No customers found matching &quot;{searchQuery}&quot;.
                                            <div className="mt-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => setIsSlideOverOpen(true)}
                                                    className="gap-1.5"
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" /> Create new customer
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        searchResults.map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => handleSelect(c)}
                                                className="w-full text-left p-3 hover:bg-accent/60 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-foreground group-hover:text-primary">
                                                            {c.first_name} {c.last_name}
                                                        </span>
                                                        {c.customer_id && (
                                                            <span className="text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono">
                                                                {c.customer_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {c.email}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {c.phone}
                                                        </span>
                                                        {c.passport_number && (
                                                            <span className="flex items-center gap-1 hidden sm:flex">
                                                                <FileText className="w-3 h-3" /> {c.passport_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}

                            {error && <p className="text-xs text-destructive font-medium mt-1">{error}</p>}
                        </div>
                    ) : (
                        /* Selected Customer Card */
                        <div className="p-5 border rounded-xl bg-card/60 shadow-xs relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-lg shrink-0">
                                        {selectedCustomer.first_name?.[0] || 'C'}
                                        {selectedCustomer.last_name?.[0] || ''}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-bold text-lg text-foreground">
                                                {selectedCustomer.first_name} {selectedCustomer.last_name}
                                            </h3>
                                            {selectedCustomer.customer_id && (
                                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-mono text-muted-foreground">
                                                    {selectedCustomer.customer_id}
                                                </span>
                                            )}
                                            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                                                Active Customer
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs text-muted-foreground pt-1">
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="w-3.5 h-3.5 text-primary" /> {selectedCustomer.email}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 text-primary" /> {selectedCustomer.phone}
                                            </span>
                                            {selectedCustomer.passport_number && (
                                                <span className="flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-primary" /> Passport:{' '}
                                                    {selectedCustomer.passport_number}
                                                </span>
                                            )}
                                            {selectedCustomer.nationality && (
                                                <span className="flex items-center gap-1.5">
                                                    <Globe className="w-3.5 h-3.5 text-primary" />{' '}
                                                    {selectedCustomer.nationality}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {!isEditing && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            onSelectCustomer({
                                                id: 0,
                                                full_name: '',
                                                phone: '',
                                                email: '',
                                                status: 'active',
                                                notes: null,
                                                nic: null,
                                                passport_number: null,
                                                dob: null,
                                                gender: null,
                                                nationality: null,
                                                whatsapp: null,
                                                address: null,
                                                emergency_contact_name: null,
                                                emergency_contact_phone: null,
                                            })
                                        }
                                        className="shrink-0 gap-1 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="w-3.5 h-3.5" /> Change
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Assigned Staff Member (Optional) */}
                    <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="assigned_to" className="text-sm font-medium">
                                Assigned Staff Handler (Optional)
                            </Label>
                            <Select
                                value={assignedToId || 'unassigned'}
                                onValueChange={(val) => onSelectAssignedTo(!val || val === 'unassigned' ? '' : val)}
                            >
                                <SelectTrigger id="assigned_to" className="h-10">
                                    <SelectValue placeholder="Assign staff member..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                                    {employees.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.first_name} {emp.last_name}{' '}
                                            {emp.designation ? `(${emp.designation})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                This staff member will manage notifications and traveler follow-up.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Slide Over for Creating New Customer */}
            <CustomerSlideOver
                open={isSlideOverOpen}
                onOpenChange={setIsSlideOverOpen}
                onCustomerCreated={handleCreatedCustomer}
            />
        </div>
    );
}
