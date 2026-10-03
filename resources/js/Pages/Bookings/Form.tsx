import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { Booking, Traveler, Customer, TourPackage } from '@/types';

interface BookingFormProps {
    booking?: Booking;
    customers: Customer[];
    packages: TourPackage[];
    travelerTypes: string[];
    isEditing?: boolean;
}

interface BookingFormData {
    customer_id: string;
    tour_package_id: string;
    booking_date: string;
    travel_date: string;
    return_date: string;
    discount_amount: number;
    notes: string;
    travelers: Partial<Traveler>[];
}

export default function BookingForm({
    booking,
    customers,
    packages,
    travelerTypes,
    isEditing = false,
}: BookingFormProps) {
    const { data, setData, post, put, processing, errors, transform } = useForm<BookingFormData>({
        customer_id: booking?.customer_id?.toString() || '',
        tour_package_id: booking?.tour_package_id?.toString() || '',
        booking_date: booking?.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        travel_date: booking?.travel_date || '',
        return_date: booking?.return_date || '',
        discount_amount: booking?.discount_amount ? Number(booking.discount_amount) : 0,
        notes: booking?.notes || '',
        travelers: (booking?.travelers || [{ full_name: '', traveler_type: 'adult' }]) as Partial<Traveler>[],
    });

    React.useEffect(() => {
        transform((data: BookingFormData) => ({
            ...data,
            discount_amount: data.discount_amount || 0,
        }));
    }, []);

    const selectedPackage = packages.find((p) => p.id.toString() === data.tour_package_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditing && booking) {
            put(route('bookings.update', booking.id as any));
        } else {
            post(route('bookings.store'));
        }
    };

    const addTraveler = () => {
        setData('travelers', [...data.travelers, { full_name: '', traveler_type: 'adult' }]);
    };

    const removeTraveler = (index: number) => {
        const newTravelers = [...data.travelers];
        newTravelers.splice(index, 1);
        setData('travelers', newTravelers as Partial<Traveler>[]);
    };

    const updateTraveler = (index: number, field: string, value: string) => {
        const newTravelers = [...data.travelers];
        newTravelers[index] = { ...newTravelers[index], [field]: value };
        setData('travelers', newTravelers as Partial<Traveler>[]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {(errors as Record<string, string>).error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{(errors as Record<string, string>).error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Details</CardTitle>
                        <CardDescription>Select the customer and tour package.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="customer_id">Customer *</Label>
                            <Select
                                value={data.customer_id}
                                onValueChange={(v) => setData('customer_id', v as string)}
                                disabled={isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.first_name} {c.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.customer_id && <p className="text-sm text-red-500">{errors.customer_id}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tour_package_id">Tour Package *</Label>
                            <Select
                                value={data.tour_package_id}
                                onValueChange={(v) => setData('tour_package_id', v as string)}
                                disabled={isEditing}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Package" />
                                </SelectTrigger>
                                <SelectContent>
                                    {packages.map((p) => (
                                        <SelectItem key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.tour_package_id && <p className="text-sm text-red-500">{errors.tour_package_id}</p>}
                        </div>

                        {selectedPackage && (
                            <div className="p-4 bg-muted rounded-md space-y-2">
                                <p className="text-sm font-medium">Package Info</p>
                                <p className="text-sm">
                                    Price: {Number(selectedPackage.price).toLocaleString()} {selectedPackage.currency}
                                </p>
                                <p className="text-sm">Capacity: {selectedPackage.capacity} travelers</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="discount_amount">Discount Amount</Label>
                            <Input
                                type="number"
                                id="discount_amount"
                                value={data.discount_amount}
                                onChange={(e) => setData('discount_amount', parseFloat(e.target.value) || 0)}
                            />
                            {errors.discount_amount && <p className="text-sm text-red-500">{errors.discount_amount}</p>}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Travel Dates</CardTitle>
                        <CardDescription>Specify the dates for this booking.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="booking_date">Booking Date *</Label>
                            <Input
                                type="date"
                                id="booking_date"
                                value={data.booking_date}
                                onChange={(e) => setData('booking_date', e.target.value)}
                            />
                            {errors.booking_date && <p className="text-sm text-red-500">{errors.booking_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="travel_date">Travel Date *</Label>
                            <Input
                                type="date"
                                id="travel_date"
                                value={data.travel_date}
                                onChange={(e) => setData('travel_date', e.target.value)}
                            />
                            {errors.travel_date && <p className="text-sm text-red-500">{errors.travel_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="return_date">Return Date</Label>
                            <Input
                                type="date"
                                id="return_date"
                                value={data.return_date || ''}
                                onChange={(e) => setData('return_date', e.target.value)}
                            />
                            {errors.return_date && <p className="text-sm text-red-500">{errors.return_date}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Travelers</CardTitle>
                        <CardDescription>Add all travelers for this booking.</CardDescription>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addTraveler}>
                        <Plus className="h-4 w-4 mr-2" /> Add Traveler
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errors.travelers && <p className="text-sm text-red-500 font-medium">{errors.travelers}</p>}
                    {data.travelers.map((traveler: Partial<Traveler>, index: number) => (
                        <div
                            key={index}
                            className="flex flex-col md:flex-row gap-4 items-start p-4 border rounded-lg relative"
                        >
                            <div className="flex-1 space-y-2 w-full">
                                <Label>Full Name *</Label>
                                <Input
                                    value={traveler.full_name || ''}
                                    onChange={(e) => updateTraveler(index, 'full_name', e.target.value)}
                                    placeholder="Traveler Name"
                                />
                                {(errors as Record<string, string>)[`travelers.${index}.full_name`] && (
                                    <p className="text-sm text-red-500">
                                        {(errors as Record<string, string>)[`travelers.${index}.full_name`]}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                                <Label>Type *</Label>
                                <Select
                                    value={traveler.traveler_type || 'adult'}
                                    onValueChange={(v) => updateTraveler(index, 'traveler_type', v as string)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {travelerTypes.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t.charAt(0).toUpperCase() + t.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(errors as Record<string, string>)[`travelers.${index}.traveler_type`] && (
                                    <p className="text-sm text-red-500">
                                        {(errors as Record<string, string>)[`travelers.${index}.traveler_type`]}
                                    </p>
                                )}
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                                <Label>Passport (Optional)</Label>
                                <Input
                                    value={traveler.passport_number || ''}
                                    onChange={(e) => updateTraveler(index, 'passport_number', e.target.value)}
                                    placeholder="Passport Number"
                                />
                            </div>
                            {data.travelers.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="md:mt-8 text-red-500"
                                    onClick={() => removeTraveler(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="submit" disabled={processing}>
                        {isEditing ? 'Update Booking' : 'Create Booking'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
