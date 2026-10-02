import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TourPackage } from '@/types';
import { MoneyText } from '@/components/common/money-text';
import { MapPin, Calendar, Clock, Users, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step2PackageDatesProps {
    packageId: string;
    onSelectPackage: (pkg: TourPackage) => void;
    bookingDate: string;
    onChangeBookingDate: (date: string) => void;
    travelDate: string;
    onChangeTravelDate: (date: string) => void;
    returnDate: string;
    onChangeReturnDate: (date: string) => void;
    packages: TourPackage[];
    errors?: Record<string, string>;
    isEditing?: boolean;
}

export default function Step2PackageDates({
    packageId,
    onSelectPackage,
    bookingDate,
    onChangeBookingDate,
    travelDate,
    onChangeTravelDate,
    returnDate,
    onChangeReturnDate,
    packages,
    errors = {},
    isEditing = false,
}: Step2PackageDatesProps) {
    const selectedPackage = packages.find(p => p.id.toString() === packageId);

    // Auto-calculate return date when travel date changes based on package duration
    const handleTravelDateChange = (newDate: string) => {
        onChangeTravelDate(newDate);
        if (newDate && selectedPackage?.duration_days) {
            const date = new Date(newDate);
            date.setDate(date.getDate() + selectedPackage.duration_days);
            const calculatedReturn = date.toISOString().split('T')[0];
            onChangeReturnDate(calculatedReturn);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-border shadow-xs">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> Tour Package & Dates
                    </CardTitle>
                    <CardDescription>
                        Select the travel destination package, departure date, and review live seat availability.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Tour Package Selection Dropdown & Grid */}
                    <div className="space-y-3">
                        <Label htmlFor="tour_package_id" className="text-sm font-medium">
                            Select Tour Package <span className="text-destructive">*</span>
                        </Label>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {packages.map(pkg => {
                                const isSelected = pkg.id.toString() === packageId;
                                return (
                                    <div
                                        key={pkg.id}
                                        onClick={() => !isEditing && onSelectPackage(pkg)}
                                        className={cn(
                                            "relative p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between gap-3 text-left",
                                            isEditing ? "opacity-90" : "cursor-pointer hover:border-primary/50 hover:shadow-xs",
                                            isSelected
                                                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                                                : "border-border bg-card"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-bold text-sm text-foreground line-clamp-1">
                                                    {pkg.name}
                                                </h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {pkg.description || 'Comprehensive tour with transfers, hotel, and sightseeing.'}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                                    <Check className="w-3.5 h-3.5" />
                                                </span>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                {pkg.duration_days && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" /> {pkg.duration_days} days
                                                    </span>
                                                )}
                                                {pkg.capacity && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3.5 h-3.5" /> Max {pkg.capacity}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="font-bold text-primary text-sm">
                                                <MoneyText
                                                    amount={Number(pkg.price || 0)}
                                                    currency={(pkg.currency as 'LKR' | 'USD') || 'LKR'}
                                                    weight="bold"
                                                />
                                                <span className="text-[10px] font-normal text-muted-foreground ml-1">/person</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.tour_package_id && (
                            <p className="text-xs text-destructive font-medium">{errors.tour_package_id}</p>
                        )}
                    </div>

                    {/* Selected Package Details Banner */}
                    {selectedPackage && (
                        <div className="p-4 bg-muted/40 border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-foreground">
                                        Selected: {selectedPackage.name}
                                    </span>
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                                        <ShieldCheck className="w-3 h-3 mr-1" /> Active
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Duration: {selectedPackage.duration_days || 'N/A'} Days</span>
                                    <span>Base Capacity: {selectedPackage.capacity || 20} Travelers</span>
                                    <span>Base Rate: {Number(selectedPackage.price).toLocaleString()} {selectedPackage.currency}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg border text-xs font-medium">
                                <Users className="w-4 h-4 text-primary" />
                                <span>Availability Status:</span>
                                <span className="text-emerald-600 font-bold">Seats Open</span>
                            </div>
                        </div>
                    )}

                    {/* Travel Dates Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
                        <div className="space-y-1.5">
                            <Label htmlFor="booking_date" className="text-sm font-medium">
                                Booking Date *
                            </Label>
                            <Input
                                id="booking_date"
                                type="date"
                                value={bookingDate}
                                onChange={e => onChangeBookingDate(e.target.value)}
                                className="h-10"
                                required
                            />
                            {errors.booking_date && (
                                <p className="text-xs text-destructive">{errors.booking_date}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="travel_date" className="text-sm font-medium">
                                Departure Date *
                            </Label>
                            <Input
                                id="travel_date"
                                type="date"
                                value={travelDate}
                                onChange={e => handleTravelDateChange(e.target.value)}
                                className="h-10"
                                required
                            />
                            {errors.travel_date && (
                                <p className="text-xs text-destructive">{errors.travel_date}</p>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="return_date" className="text-sm font-medium">
                                Return Date (Optional)
                            </Label>
                            <Input
                                id="return_date"
                                type="date"
                                value={returnDate || ''}
                                onChange={e => onChangeReturnDate(e.target.value)}
                                className="h-10"
                            />
                            {errors.return_date && (
                                <p className="text-xs text-destructive">{errors.return_date}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
