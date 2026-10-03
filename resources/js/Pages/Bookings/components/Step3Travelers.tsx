import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Customer } from '@/types';
import { Users, Plus, Trash2, Copy, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TravelerRow {
    id?: number;
    full_name: string;
    traveler_type: 'adult' | 'child' | 'infant';
    passport_number?: string;
    passport_expiry?: string;
    dob?: string;
    gender?: string;
    nationality?: string;
    nic?: string;
    relationship_to_primary?: string;
    special_requirements?: string;
    notes?: string;
}

interface Step3TravelersProps {
    travelers: TravelerRow[];
    onChangeTravelers: (travelers: TravelerRow[]) => void;
    customer?: Customer;
    travelerTypes: string[];
    errors?: Record<string, string>;
}

export default function Step3Travelers({
    travelers,
    onChangeTravelers,
    customer,
    travelerTypes,
    errors = {},
}: Step3TravelersProps) {
    const addTraveler = () => {
        onChangeTravelers([
            ...travelers,
            {
                full_name: '',
                traveler_type: 'adult',
                passport_number: '',
                passport_expiry: '',
                dob: '',
                gender: 'Male',
                nationality: 'Sri Lankan',
                relationship_to_primary: '',
                special_requirements: '',
            },
        ]);
    };

    const removeTraveler = (index: number) => {
        if (travelers.length <= 1) return;
        const updated = travelers.filter((_, i) => i !== index);
        onChangeTravelers(updated);
    };

    const updateTraveler = (index: number, field: keyof TravelerRow, value: any) => {
        const updated = [...travelers];
        updated[index] = { ...updated[index], [field]: value };
        onChangeTravelers(updated);
    };

    const copyFromCustomer = (index: number) => {
        if (!customer) return;
        const updated = [...travelers];
        const fullName = customer.full_name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        updated[index] = {
            ...updated[index],
            full_name: fullName,
            passport_number: customer.passport_number || '',
            nationality: customer.nationality || 'Sri Lankan',
            dob: customer.dob || '',
            gender: customer.gender || 'Male',
            nic: customer.nic || '',
            relationship_to_primary: 'Primary Customer',
        };
        onChangeTravelers(updated);
    };

    return (
        <div className="space-y-6">
            <Card className="border-border shadow-xs">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-4">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Users className="w-5 h-5 text-primary" /> Travelers ({travelers.length})
                        </CardTitle>
                        <CardDescription>
                            Enter passenger details for visas, ticketing, and tour manifest.
                        </CardDescription>
                    </div>

                    <Button
                        type="button"
                        onClick={addTraveler}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-primary text-primary hover:bg-primary/5 self-start sm:self-auto"
                    >
                        <Plus className="w-4 h-4" /> Add Another Traveler
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errors.travelers && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {errors.travelers}
                        </div>
                    )}

                    {travelers.map((traveler, index) => {
                        const rowError = (field: string) => errors[`travelers.${index}.${field}`];

                        return (
                            <div
                                key={index}
                                className="p-4 sm:p-5 border rounded-xl bg-card/60 shadow-xs relative transition-all duration-200 space-y-4"
                            >
                                <div className="flex items-center justify-between border-b pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                                            {index + 1}
                                        </span>
                                        <h4 className="font-semibold text-sm text-foreground">
                                            Traveler #{index + 1}
                                            {index === 0 && (
                                                <span className="ml-2 text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                    Lead Passenger
                                                </span>
                                            )}
                                        </h4>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {customer && index === 0 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyFromCustomer(index)}
                                                className="text-xs gap-1.5 text-primary hover:bg-primary/10 h-8"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" /> Copy Customer Info
                                            </Button>
                                        )}

                                        {travelers.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeTraveler(index)}
                                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                title="Remove Traveler"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {/* Full Name */}
                                    <div className="space-y-1.5 lg:col-span-2">
                                        <Label htmlFor={`name_${index}`} className="text-xs font-medium">
                                            Full Name (as per Passport) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id={`name_${index}`}
                                            value={traveler.full_name}
                                            onChange={(e) => updateTraveler(index, 'full_name', e.target.value)}
                                            placeholder="e.g. Johnathan Doe"
                                            className={cn('h-10', rowError('full_name') && 'border-destructive')}
                                            required
                                        />
                                        {rowError('full_name') && (
                                            <p className="text-[11px] text-destructive">{rowError('full_name')}</p>
                                        )}
                                    </div>

                                    {/* Traveler Type */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`type_${index}`} className="text-xs font-medium">
                                            Passenger Category <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={traveler.traveler_type}
                                            onValueChange={(val) => updateTraveler(index, 'traveler_type', val)}
                                        >
                                            <SelectTrigger id={`type_${index}`} className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="adult">Adult (12+ yrs)</SelectItem>
                                                <SelectItem value="child">Child (2-11 yrs)</SelectItem>
                                                <SelectItem value="infant">Infant (Under 2 yrs)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Passport Number */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`passport_${index}`} className="text-xs font-medium">
                                            Passport Number
                                        </Label>
                                        <Input
                                            id={`passport_${index}`}
                                            value={traveler.passport_number || ''}
                                            onChange={(e) => updateTraveler(index, 'passport_number', e.target.value)}
                                            placeholder="e.g. N9876543"
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Passport Expiry */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`passport_expiry_${index}`} className="text-xs font-medium">
                                            Passport Expiry Date
                                        </Label>
                                        <Input
                                            id={`passport_expiry_${index}`}
                                            type="date"
                                            value={traveler.passport_expiry || ''}
                                            onChange={(e) => updateTraveler(index, 'passport_expiry', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* DOB */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`dob_${index}`} className="text-xs font-medium">
                                            Date of Birth
                                        </Label>
                                        <Input
                                            id={`dob_${index}`}
                                            type="date"
                                            value={traveler.dob || ''}
                                            onChange={(e) => updateTraveler(index, 'dob', e.target.value)}
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Nationality */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`nationality_${index}`} className="text-xs font-medium">
                                            Nationality
                                        </Label>
                                        <Input
                                            id={`nationality_${index}`}
                                            value={traveler.nationality || ''}
                                            onChange={(e) => updateTraveler(index, 'nationality', e.target.value)}
                                            placeholder="Sri Lankan"
                                            className="h-10"
                                        />
                                    </div>

                                    {/* Gender */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`gender_${index}`} className="text-xs font-medium">
                                            Gender
                                        </Label>
                                        <Select
                                            value={traveler.gender || 'Male'}
                                            onValueChange={(val) => updateTraveler(index, 'gender', val)}
                                        >
                                            <SelectTrigger id={`gender_${index}`} className="h-10">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Special Requirements */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor={`req_${index}`} className="text-xs font-medium">
                                            Special Dietary / Medical Requirements
                                        </Label>
                                        <Input
                                            id={`req_${index}`}
                                            value={traveler.special_requirements || ''}
                                            onChange={(e) =>
                                                updateTraveler(index, 'special_requirements', e.target.value)
                                            }
                                            placeholder="e.g. Vegetarian, Wheelchair assistance"
                                            className="h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}
