<?php

return [
    'tiers' => [
        'semi_luxury' => [
            'label' => 'Semi Luxury',
            'description' => '[CONFIRM] owner text',
        ],
        'luxury' => [
            'label' => 'Luxury',
            'description' => '[CONFIRM] owner text',
        ],
        'premium' => [
            'label' => 'Premium',
            'description' => '[CONFIRM] owner text',
        ],
    ],

    'allowed_by_destination' => [
        'thailand' => ['semi_luxury', 'luxury', 'premium'],
        'india' => ['semi_luxury', 'luxury'],
    ],

    'suggested_group_size' => [
        'india' => [
            'semi_luxury' => [30, 40],
            'luxury' => [10, 15],
        ],
        'india.semi_luxury' => [30, 40],
        'india.luxury' => [10, 15],
    ],
];
