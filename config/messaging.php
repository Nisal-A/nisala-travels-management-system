<?php

return [
    'sms_enabled' => env('NOTIFICATIONS_SMS_ENABLED', false),
    'default' => env('MESSAGING_PROVIDER', 'log'),

    'providers' => [
        'twilio' => [
            'sid' => env('TWILIO_SID'),
            'token' => env('TWILIO_TOKEN'),
            'from' => env('TWILIO_FROM'),
        ],
    ],
];
