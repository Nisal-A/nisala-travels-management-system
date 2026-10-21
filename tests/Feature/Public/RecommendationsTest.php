<?php

use App\Models\Destination;
use Database\Seeders\PublicContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
});

test('seeder runs without errors on a fresh database and seeds exact recommendations', function () {
    $this->seed(PublicContentSeeder::class);

    $expected = [
        'thailand' => [
            'Dress modestly at temples: cover your shoulders and knees, and take off your shoes before entering temple buildings.',
            'Carry some Thai baht for markets and small shops, and use cards at hotels and larger shops.',
            'Show respect for the royal family, and don\'t post disrespectful comments or photos about them.',
            'Book island boat tours and sunset cruises early during the busy months, November to April.',
            'Pack sun protection and a light rain jacket, since weather can change quickly in the monsoon months.',
        ],
        'india' => [
            'Check health advice and vaccination requirements before you go, and carry a basic first-aid kit with any personal medicine.',
            'Drink only sealed bottled water, and be careful with street food in the first days.',
            'Dress modestly at temples and religious sites, and remove your shoes where asked.',
            'Keep valuables secure in busy markets and on crowded trains.',
            'Travel with a company guide for long drives and temple visits, and allow extra time for road journeys.',
        ],
        'sri-lanka' => [
            'Plan around the season: the south-west coast is best from December to April, and the east coast from April to September.',
            'Dress modestly at temples such as Sigiriya and Anuradhapura, covering your shoulders and knees.',
            'Book Sigiriya climbs and Yala safaris early, since visitor numbers are limited.',
            'Use licensed guides and vehicles, and agree on fares before the trip starts.',
            'Carry sun protection and drink plenty of water in the dry zones.',
        ],
        'maldives' => [
            'Resort islands allow swimwear. Local islands require modest clothing, so plan your outfits for each part of the trip.',
            'Alcohol is sold only at resorts and on some islands, so check the rules before you travel.',
            'Use reef-safe sunscreen, and don\'t touch or stand on coral.',
            'Book water activities with certified operators, and check sea conditions before each trip.',
            'Plan transfers in advance, since many islands are reached by speedboat or seaplane.',
        ],
    ];

    foreach ($expected as $slug => $recommendations) {
        $destination = Destination::where('slug', $slug)->first();
        expect($destination)->not->toBeNull("Destination {$slug} must be seeded");
        expect($destination->recommendations)->toBe($recommendations);
    }
});

test('public destination API response includes the exact recommendations', function () {
    $this->seed(PublicContentSeeder::class);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')
        ->getJson('/api/public/destinations');

    $response->assertStatus(200);

    $data = collect($response->json('data'));

    $thailand = $data->firstWhere('slug', 'thailand');
    expect($thailand['recommendations'])->toBe([
        'Dress modestly at temples: cover your shoulders and knees, and take off your shoes before entering temple buildings.',
        'Carry some Thai baht for markets and small shops, and use cards at hotels and larger shops.',
        'Show respect for the royal family, and don\'t post disrespectful comments or photos about them.',
        'Book island boat tours and sunset cruises early during the busy months, November to April.',
        'Pack sun protection and a light rain jacket, since weather can change quickly in the monsoon months.',
    ]);

    $india = $data->firstWhere('slug', 'india');
    expect($india['recommendations'])->toBe([
        'Check health advice and vaccination requirements before you go, and carry a basic first-aid kit with any personal medicine.',
        'Drink only sealed bottled water, and be careful with street food in the first days.',
        'Dress modestly at temples and religious sites, and remove your shoes where asked.',
        'Keep valuables secure in busy markets and on crowded trains.',
        'Travel with a company guide for long drives and temple visits, and allow extra time for road journeys.',
    ]);

    $sriLanka = $data->firstWhere('slug', 'sri-lanka');
    expect($sriLanka['recommendations'])->toBe([
        'Plan around the season: the south-west coast is best from December to April, and the east coast from April to September.',
        'Dress modestly at temples such as Sigiriya and Anuradhapura, covering your shoulders and knees.',
        'Book Sigiriya climbs and Yala safaris early, since visitor numbers are limited.',
        'Use licensed guides and vehicles, and agree on fares before the trip starts.',
        'Carry sun protection and drink plenty of water in the dry zones.',
    ]);

    $maldives = $data->firstWhere('slug', 'maldives');
    expect($maldives['recommendations'])->toBe([
        'Resort islands allow swimwear. Local islands require modest clothing, so plan your outfits for each part of the trip.',
        'Alcohol is sold only at resorts and on some islands, so check the rules before you travel.',
        'Use reef-safe sunscreen, and don\'t touch or stand on coral.',
        'Book water activities with certified operators, and check sea conditions before each trip.',
        'Plan transfers in advance, since many islands are reached by speedboat or seaplane.',
    ]);
});
