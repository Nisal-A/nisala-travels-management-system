<?php

return [
    'categories' => [
        'bookings' => [
            'label' => 'Bookings',
            'types' => [
                'booking_confirmed' => [
                    'label' => 'Booking Confirmed',
                    'description' => 'When a new booking is confirmed.',
                    'audience' => ['customer', 'staff'],
                    'channels' => ['mail', 'database', 'sms', 'whatsapp'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => true,
                ],
                'new_inquiry' => [
                    'label' => 'New Inquiry',
                    'description' => 'When a new inquiry is submitted.',
                    'audience' => ['staff'],
                    'channels' => ['mail', 'database', 'sms'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => false,
                ],
            ]
        ],
        'payments' => [
            'label' => 'Payments',
            'types' => [
                'payment_received' => [
                    'label' => 'Payment Received',
                    'description' => 'When a payment is successfully processed.',
                    'audience' => ['customer', 'staff'],
                    'channels' => ['mail', 'database', 'sms', 'whatsapp'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => true,
                ],
                'payment_overdue' => [
                    'label' => 'Payment Overdue',
                    'description' => 'When a payment schedule is missed.',
                    'audience' => ['customer', 'staff'],
                    'channels' => ['mail', 'database', 'sms'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => false,
                ],
            ]
        ],
        'documents' => [
            'label' => 'Documents',
            'types' => [
                'document_uploaded' => [
                    'label' => 'Document Uploaded',
                    'description' => 'When a customer uploads a document.',
                    'audience' => ['staff'],
                    'channels' => ['mail', 'database'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => false,
                ],
                'document_verified' => [
                    'label' => 'Document Verified',
                    'description' => 'When a document is verified by staff.',
                    'audience' => ['customer'],
                    'channels' => ['mail', 'database'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => false,
                ],
                'document_rejected' => [
                    'label' => 'Document Rejected',
                    'description' => 'When a document is rejected and needs re-upload.',
                    'audience' => ['customer'],
                    'channels' => ['mail', 'database', 'sms'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => false,
                ],
            ]
        ],
        'trip_reminders' => [
            'label' => 'Trip Reminders',
            'types' => [
                'trip_reminder' => [
                    'label' => 'Upcoming Trip Reminder',
                    'description' => 'Reminders about your upcoming trips.',
                    'audience' => ['customer'],
                    'channels' => ['mail', 'database', 'sms', 'whatsapp'],
                    'default_enabled' => ['mail', 'database'],
                    'mandatory' => false,
                ],
            ]
        ]
    ]
];
