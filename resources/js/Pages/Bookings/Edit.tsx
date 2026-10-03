import React from 'react';
import Create from './Create';
import { Booking, Customer, TourPackage, Employee } from '@/types';

interface Props {
    booking: Booking;
    customers: Customer[];
    packages: TourPackage[];
    employees?: Employee[];
    travelerTypes: string[];
    canDiscount?: boolean;
}

export default function Edit(props: Props) {
    return <Create {...props} employees={props.employees || []} isEditing={true} />;
}
