@extends('emails.layout')

@php
    $preheader = 'Action required: You have an overdue payment of ' . number_format($payment->amount, 2) . ' ' . $payment->currency;
@endphp

@section('content')
    <h1>Payment Overdue Notice</h1>
    <p>Hi {{ $customerName }},</p>
    <p>This is a polite reminder that a payment for your booking <strong>{{ $payment->booking->booking_reference ?? '' }}</strong> is now overdue.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; background-color: #fef2f2;">
        <tr>
            <td style="padding: 12px 16px;"><strong>Amount Due:</strong></td>
            <td style="padding: 12px 16px; text-align: right; color: #dc2626;"><strong>{{ number_format($payment->amount, 2) }} {{ $payment->currency }}</strong></td>
        </tr>
        <tr>
            <td style="padding: 12px 16px;"><strong>Due Date:</strong></td>
            <td style="padding: 12px 16px; text-align: right;">{{ \Carbon\Carbon::parse($payment->due_date)->format('M d, Y') }}</td>
        </tr>
    </table>

    <h2>How to pay</h2>
    <p>To ensure your booking remains confirmed and to avoid any disruptions to your travel plans, please settle this amount as soon as possible through your customer portal.</p>

    <div class="button-wrap">
        <a href="{{ url('/portal/payments') }}" class="button">Pay Now</a>
    </div>

    <p>If you have already made this payment or need assistance, please reply to this email or contact our support team.</p>
@endsection
