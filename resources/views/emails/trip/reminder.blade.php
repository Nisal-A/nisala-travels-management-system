@extends('emails.layout')

@php
    $preheader = 'Your trip to ' . ($booking->tourPackage->destination->name ?? 'your destination') . ' is coming up in ' . $daysBefore . ' days!';
@endphp

@section('content')
    <h1>Trip Reminder: {{ $daysBefore }} Days to Go!</h1>
    <p>Hi {{ $customerName }},</p>
    <p>Get ready! Your departure for <strong>{{ $booking->tourPackage->name ?? 'your tour' }}</strong> is just around the corner.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; background-color: #f8fafc; padding: 16px;">
        <tr>
            <td style="padding: 8px 16px;"><strong>Departure Date:</strong></td>
            <td style="padding: 8px 16px; text-align: right;">{{ \Carbon\Carbon::parse($booking->start_date)->format('M d, Y') }}</td>
        </tr>
        <tr>
            <td style="padding: 8px 16px;"><strong>Departure Time:</strong></td>
            <td style="padding: 8px 16px; text-align: right;">Please check your final itinerary</td>
        </tr>
    </table>

    <h2>Pre-Departure Checklist</h2>
    <ul style="margin-bottom: 24px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Check passport validity (at least 6 months from travel dates).</li>
        <li style="margin-bottom: 8px;">Ensure you have your visa or ETA (if applicable).</li>
        <li style="margin-bottom: 8px;">Upload any missing documents in your customer portal.</li>
        <li style="margin-bottom: 8px;">Ensure all pending payments are settled.</li>
    </ul>

    <div class="callout" style="background-color: #f0fdf4; border-left-color: #22c55e;">
        <strong>Emergency Contact:</strong><br>
        If you face any issues during your trip, please contact us at {{ company_setting('phone') }}.
    </div>

    <div class="button-wrap">
        <a href="{{ url('/portal/bookings/' . $booking->id) }}" class="button">Go to my portal</a>
    </div>
@endsection
