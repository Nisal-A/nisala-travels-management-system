@extends('emails.layout')

@php
    $preheader = 'Receipt for your recent payment of ' . number_format($payment->amount, 2) . ' ' . $payment->currency;
@endphp

@section('content')
    <h1>Payment Receipt</h1>
    <p>Hi {{ $customerName }},</p>
    <p>Thank you for your payment. We have successfully received it and applied it to your booking <strong>{{ $payment->booking->booking_reference ?? '' }}</strong>.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-top: 1px solid #e2e8f0;">
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Amount Paid:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ number_format($payment->amount, 2) }} {{ $payment->currency }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Date:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ \Carbon\Carbon::parse($payment->payment_date)->format('M d, Y') }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Payment Method:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ ucfirst($payment->payment_method instanceof \BackedEnum ? $payment->payment_method->value : (string) $payment->payment_method) }}</td>
        </tr>
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Receipt Number:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">{{ $payment->receipt?->receipt_number ?? "RCP-{$payment->id}" }}</td>
        </tr>
        @if($payment->booking)
        <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;"><strong>Remaining Balance:</strong></td>
            <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; text-align: right;"><strong>{{ number_format(($payment->booking->balance_amount ?? ($payment->booking->final_amount - $payment->booking->paid_amount)), 2) }} {{ $payment->booking->currency }}</strong></td>
        </tr>
        @endif
    </table>

    <div class="button-wrap">
        <a href="{{ url('/portal/payments/' . $payment->id) }}" class="button">Download receipt</a>
    </div>

    <p>You can always view your payment history and download receipts from your customer portal.</p>
@endsection
