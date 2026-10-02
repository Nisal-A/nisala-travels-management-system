<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Itinerary - {{ $booking->booking_reference }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #0284c7;
            margin-bottom: 5px;
        }
        .title {
            font-size: 20px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .summary-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }
        .summary-row {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .summary-label {
            display: table-cell;
            font-weight: bold;
            width: 30%;
            color: #475569;
        }
        .summary-value {
            display: table-cell;
            width: 70%;
        }
        .section-title {
            font-size: 18px;
            color: #0284c7;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
            margin-bottom: 15px;
            margin-top: 30px;
        }
        .itinerary-day {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .day-header {
            font-weight: bold;
            font-size: 16px;
            background-color: #f1f5f9;
            padding: 8px 12px;
            border-left: 4px solid #0284c7;
            margin-bottom: 10px;
        }
        .day-content {
            padding-left: 16px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">Nisala Travels</div>
        <div class="title">Travel Itinerary</div>
    </div>

    <div class="summary-box">
        <div class="summary-row">
            <div class="summary-label">Booking Reference:</div>
            <div class="summary-value">{{ $booking->booking_reference }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Destination:</div>
            <div class="summary-value">{{ $booking->tourPackage->name ?? 'Custom Destination' }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Travel Date:</div>
            <div class="summary-value">{{ $booking->travel_date->format('F j, Y') }} - {{ $booking->return_date ? $booking->return_date->format('F j, Y') : 'TBD' }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Primary Customer:</div>
            <div class="summary-value">{{ $booking->customer->full_name ?? 'N/A' }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Number of Travelers:</div>
            <div class="summary-value">{{ $booking->number_of_travelers }}</div>
        </div>
    </div>

    <div class="section-title">Travelers</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                <th style="text-align: left; padding: 10px; border: 1px solid #e2e8f0;">Name</th>
                <th style="text-align: left; padding: 10px; border: 1px solid #e2e8f0;">Type</th>
            </tr>
        </thead>
        <tbody>
            @foreach($booking->travelers as $traveler)
            <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">{{ $traveler->first_name }} {{ $traveler->last_name }}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-transform: capitalize;">{{ $traveler->traveler_type }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="section-title">Daily Itinerary</div>
    
    <!-- Mocked Itinerary for now -->
    <div class="itinerary-day">
        <div class="day-header">Day 1: Arrival & Check-in ({{ $booking->travel_date->format('M j, Y') }})</div>
        <div class="day-content">
            <p>Arrive at the destination airport. Meet our local representative who will assist you with the transfer to your hotel. Rest and acclimatize to the local environment.</p>
        </div>
    </div>

    <div class="itinerary-day">
        <div class="day-header">Day 2: Exploring the City ({{ $booking->travel_date->addDay()->format('M j, Y') }})</div>
        <div class="day-content">
            <p>After breakfast, embark on a full-day guided city tour. Visit major historical landmarks, museums, and local markets. Enjoy lunch at a highly-rated local restaurant.</p>
        </div>
    </div>
    
    <div class="itinerary-day">
        <div class="day-header">Departure ({{ $booking->return_date ? $booking->return_date->format('M j, Y') : 'Final Day' }})</div>
        <div class="day-content">
            <p>Enjoy a relaxed morning. Depending on your flight schedule, transfer to the airport for your onward journey. Safe travels!</p>
        </div>
    </div>
    
    @if($booking->notes)
    <div class="section-title">Important Notes</div>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px;">
        {{ $booking->notes }}
    </div>
    @endif

    <div class="footer">
        <p>Thank you for choosing Nisala Travels. We wish you a wonderful trip!</p>
        <p>Contact us: support@nisalatravels.com | +94 11 234 5678</p>
    </div>
</body>
</html>
