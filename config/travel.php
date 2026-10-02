<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Company Details
    |--------------------------------------------------------------------------
    |
    | Used on PDF receipts, invoices, and customer-facing documents.
    |
    */

    'company' => [
        'name' => env('COMPANY_NAME', 'Nisala Travels (Pvt) Ltd'),
        'address' => env('COMPANY_ADDRESS', '123 Travel Street, Colombo 03, Sri Lanka'),
        'phone' => env('COMPANY_PHONE', '+94 11 234 5678'),
        'email' => env('COMPANY_EMAIL', 'info@nisalatravels.com'),
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
        'bank' => env('PAYMENT_BANK', 'Commercial Bank of Ceylon'),
        'account_name' => env('PAYMENT_ACCOUNT_NAME', 'Nisala Travels (Pvt) Ltd'),
        'account_number' => env('PAYMENT_ACCOUNT_NUMBER', '1234567890'),
        'branch' => env('PAYMENT_BRANCH', 'Colombo Main'),
        'notes' => env('PAYMENT_NOTES', 'Please mention your Booking Reference in the transfer reference and email the receipt to billing@nisalatravels.com.'),
    ],

];
