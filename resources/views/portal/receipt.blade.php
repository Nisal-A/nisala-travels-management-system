<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt - {{ $payment->receipt_number }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.6; }
        .header { border-bottom: 2px solid #0056b3; padding-bottom: 20px; margin-bottom: 30px; }
        .company-name { font-size: 24px; font-weight: bold; color: #0056b3; margin-bottom: 5px; }
        .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .info-table { width: 100%; margin-bottom: 30px; }
        .info-table td { vertical-align: top; width: 50%; }
        .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
        .details-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; font-size: 16px; }
        .total-row td { border-top: 2px solid #333; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 50px; border-top: 1px solid #e0e0e0; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">{{ $company['name'] }}</div>
        <div>{{ $company['address'] }}</div>
        <div>Phone: {{ $company['phone'] }} | Email: {{ $company['email'] }}</div>
    </div>

    <div class="title">Payment Receipt</div>

    <table class="info-table">
        <tr>
            <td>
                <strong>Billed To:</strong><br>
                {{ $customer->first_name }} {{ $customer->last_name }}<br>
                {{ $customer->email }}<br>
                {{ $customer->phone }}
            </td>
            <td>
                <strong>Receipt No:</strong> {{ $payment->receipt_number }}<br>
                <strong>Date:</strong> {{ $payment->payment_date->format('F d, Y') }}<br>
                <strong>Booking Ref:</strong> {{ $payment->booking->booking_reference ?? 'BKG-'.$payment->booking->id }}<br>
                <strong>Tour:</strong> {{ $payment->booking->tourPackage->name ?? 'Custom Tour' }}
            </td>
        </tr>
    </table>

    <table class="details-table">
        <thead>
            <tr>
                <th>Description</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th style="text-align: right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Payment for Booking {{ $payment->booking->booking_reference ?? 'BKG-'.$payment->booking->id }}</td>
                <td>{{ ucfirst($payment->payment_method->value ?? 'Unknown') }}</td>
                <td>{{ ucfirst($payment->status->value ?? 'Unknown') }}</td>
                <td style="text-align: right">{{ number_format($payment->amount, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="3" style="text-align: right">Total Paid</td>
                <td style="text-align: right">Rs. {{ number_format($payment->amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Thank you for choosing {{ $company['name'] }}. If you have any questions, please contact us.
    </div>
</body>
</html>
