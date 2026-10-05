@extends('emails.layout')

@php
    $preheader = 'Your booking ' . $booking->booking_reference . ' is confirmed!';
@endphp

@section('content')
    <h1>Booking Confirmed</h1>
    <p>Hi {{ $customerName }},</p>
    <p>Great news! Your booking <strong>{{ $booking->booking_reference }}</strong> has been confirmed.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #e2e8f0;">
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Destination:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $booking->tourPackage->destination->name ?? 'TBA' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Dates:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ \Carbon\Carbon::parse($booking->start_date)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($booking->end_date)->format('M d, Y') }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Travelers:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $booking->travelers_count ?? 1 }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Total Amount:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ number_format($booking->total_price, 2) }} {{ $booking->currency ?? 'LKR' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Amount Paid:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ number_format($booking->paid_amount ?? 0, 2) }} {{ $booking->currency ?? 'LKR' }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Balance Due:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong>{{ number_format(($booking->total_price - ($booking->paid_amount ?? 0)), 2) }} {{ $booking->currency ?? 'LKR' }}</strong></td>
        </tr>
    </table>

    <div class="button-wrap">
        <a href="{{ url('/portal/bookings/' . $booking->id) }}" class="button">View my booking</a>
    </div>

    <h2>What happens next?</h2>
    <p>Please log in to your portal to upload any required travel documents (such as passport copies) and review your payment schedule.</p>
    
    <p>If you have any questions, simply reply to this email.</p>
@endsection
