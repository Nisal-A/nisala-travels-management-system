<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Details
    |--------------------------------------------------------------------------
    |
    | Used on PDF receipts, invoices, exports, and customer-facing documents.
    |
    */

    'company' => [
        'name' => env('COMPANY_NAME', 'Nisala Travels'),
        'address' => env('COMPANY_ADDRESS', 'Airport Road, Hingurakgoda, Sri Lanka'),
        'phone' => env('COMPANY_PHONE', '071 9951812 and 076 1277010'),
        'phones' => env('COMPANY_PHONES', '071 9951812 and 076 1277010'),
        'website' => env('COMPANY_WEBSITE', 'www.nisalatravels.com'),
        'email' => env('COMPANY_EMAIL', 'info@example.com'),
        'registration_number' => env('COMPANY_REGISTRATION_NUMBER', ''),
        'bank_details' => env('COMPANY_BANK_DETAILS', 'Example Bank, Example Branch, Nisala Travels, 0000000000'),
        'logo_path' => env('COMPANY_LOGO_PATH', 'public/images/nisala-travels-full-logo.png'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Instructions
    |--------------------------------------------------------------------------
    |
    | Bank transfer details shown to customers in the portal.
    | Override via .env or by publishing this config.
    |
    */

    'payment_instructions' => [
        'bank' => env('PAYMENT_BANK', 'Example Bank'),
        'account_name' => env('PAYMENT_ACCOUNT_NAME', 'Nisala Travels'),
        'account_number' => env('PAYMENT_ACCOUNT_NUMBER', '0000000000'),
        'branch' => env('PAYMENT_BRANCH', 'Example Branch'),
        'notes' => env('PAYMENT_NOTES', 'Please mention your Booking Reference in the transfer reference and email the receipt to info@example.com.'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Report Thresholds & Configurations
    |--------------------------------------------------------------------------
    */

    'reports' => [
        'upcoming_tours' => [
            'low_seats_threshold_percentage' => (float) env('UPCOMING_TOURS_LOW_SEATS_THRESHOLD', 20.0),
            'starting_soon_days' => (int) env('UPCOMING_TOURS_STARTING_SOON_DAYS', 7),
        ],
    ],

];

