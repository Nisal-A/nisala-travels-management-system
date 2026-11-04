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
    @php
        $companyName = $company['name'] ?? config('travel.company.name', 'Nisala Travels');
        $companyEmail = $company['email'] ?? config('travel.company.email', 'support@nisalatravels.com');
        $companyPhone = $company['phone'] ?? config('travel.company.phone', '+94 11 234 5678');
        $packageName = $booking->tourPackage?->package_name ?? $booking->tourPackage?->name ?? 'Custom Tour Package';
        $destinationLabel = $booking->tourPackage?->destination
            ? trim(($booking->tourPackage->destination->city_region ? $booking->tourPackage->destination->city_region . ', ' : '') . $booking->tourPackage->destination->country)
            : $packageName;
        $itineraryItems = is_array($booking->tourPackage?->itinerary) ? $booking->tourPackage->itinerary : [];
    @endphp

    <div class="header">
        <div class="logo">{{ $companyName }}</div>
        <div class="title">Travel Itinerary</div>
    </div>

    <div class="summary-box">
        <div class="summary-row">
            <div class="summary-label">Booking Reference:</div>
            <div class="summary-value">{{ $booking->booking_reference }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Tour Package:</div>
            <div class="summary-value">{{ $packageName }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Destination:</div>
            <div class="summary-value">{{ $destinationLabel }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Travel Date:</div>
            <div class="summary-value">{{ $booking->travel_date ? $booking->travel_date->format('F j, Y') : 'TBD' }} - {{ $booking->return_date ? $booking->return_date->format('F j, Y') : 'TBD' }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Primary Customer:</div>
            <div class="summary-value">{{ $booking->customer->full_name ?? 'N/A' }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Number of Travelers:</div>
            <div class="summary-value">{{ $booking->number_of_travelers }}</div>
        </div>
        <div class="summary-row">
            <div class="summary-label">Booking Status:</div>
            <div class="summary-value">{{ ucfirst($booking->booking_status instanceof \BackedEnum ? $booking->booking_status->value : (string) $booking->booking_status) }}</div>
        </div>
    </div>

    <div class="section-title">Travelers</div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
            <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                <th style="text-align: left; padding: 10px; border: 1px solid #e2e8f0;">Name</th>
                <th style="text-align: left; padding: 10px; border: 1px solid #e2e8f0;">Type</th>
                <th style="text-align: left; padding: 10px; border: 1px solid #e2e8f0;">Passport / Nationality</th>
            </tr>
        </thead>
        <tbody>
            @forelse($booking->travelers as $traveler)
            <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">{{ $traveler->full_name ?: trim(($traveler->first_name ?? '') . ' ' . ($traveler->last_name ?? '')) }}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-transform: capitalize;">{{ $traveler->traveler_type instanceof \BackedEnum ? $traveler->traveler_type->value : $traveler->traveler_type }}</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">{{ $traveler->passport_number ?? 'N/A' }}{{ $traveler->nationality ? ' (' . $traveler->nationality . ')' : '' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="3" style="padding: 10px; border: 1px solid #e2e8f0;">{{ $booking->customer->full_name ?? 'Primary Traveler' }}</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">Daily Itinerary</div>

    @if(count($itineraryItems) > 0)
        @foreach($itineraryItems as $index => $dayItem)
            @php
                $dayNumber = $dayItem['day'] ?? ($index + 1);
                $dayTitle = $dayItem['title'] ?? ('Day ' . $dayNumber);
                $dayDesc = $dayItem['description'] ?? '';
                $dayDate = $booking->travel_date ? $booking->travel_date->copy()->addDays((int) $dayNumber - 1)->format('M j, Y') : null;
            @endphp
            <div class="itinerary-day">
                <div class="day-header">Day {{ $dayNumber }}: {{ $dayTitle }}{{ $dayDate ? ' (' . $dayDate . ')' : '' }}</div>
                <div class="day-content">
                    <p>{{ $dayDesc }}</p>
                </div>
            </div>
        @endforeach
    @else
        <div class="itinerary-day">
            <div class="day-header">Day 1: Arrival &amp; Check-in ({{ $booking->travel_date ? $booking->travel_date->format('M j, Y') : 'Day 1' }})</div>
            <div class="day-content">
                <p>Arrive at {{ $destinationLabel }}. Meet our {{ $companyName }} representative for hotel transfer and check-in.</p>
            </div>
        </div>
        @if($booking->tourPackage?->description)
        <div class="itinerary-day">
            <div class="day-header">Tour Programme Overview</div>
            <div class="day-content">
                <p>{{ $booking->tourPackage->description }}</p>
            </div>
        </div>
        @endif
        <div class="itinerary-day">
            <div class="day-header">Departure ({{ $booking->return_date ? $booking->return_date->format('M j, Y') : 'Final Day' }})</div>
            <div class="day-content">
                <p>Check out and transfer to the airport for your onward journey.</p>
            </div>
        </div>
    @endif

    @if($booking->notes)
    <div class="section-title">Important Notes</div>
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px;">
        {{ $booking->notes }}
    </div>
    @endif

    <div class="footer">
        <p>Thank you for choosing {{ $companyName }}. We wish you a wonderful trip!</p>
        <p>Contact us: {{ $companyEmail }} | {{ $companyPhone }}</p>
    </div>
</body>
</html>
