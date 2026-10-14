<?php

use App\Models\Destination;
use App\Models\Inquiry;
use App\Models\TourPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

test('Destination::published() excludes status other than active and excludes soft-deleted rows', function () {
    $active = Destination::create([
        'country' => 'Sri Lanka',
        'city_region' => 'Colombo',
        'status' => 'active',
        'slug' => 'colombo',
    ]);

    $inactive = Destination::create([
        'country' => 'Sri Lanka',
        'city_region' => 'Kandy',
        'status' => 'inactive',
        'slug' => 'kandy',
    ]);

    $draft = Destination::create([
        'country' => 'Sri Lanka',
        'city_region' => 'Galle',
        'status' => 'draft',
        'slug' => 'galle',
    ]);

    $softDeleted = Destination::create([
        'country' => 'Sri Lanka',
        'city_region' => 'Ella',
        'status' => 'active',
        'slug' => 'ella',
    ]);
    $softDeleted->delete();

    $published = Destination::published()->get();

    expect($published->pluck('id')->all())->toBe([$active->id])
        ->and($published->contains('id', $inactive->id))->toBeFalse()
        ->and($published->contains('id', $draft->id))->toBeFalse()
        ->and($published->contains('id', $softDeleted->id))->toBeFalse();
});

test('TourPackage::published() excludes is_active false and status other than active', function () {
    $destination = Destination::create([
        'country' => 'Sri Lanka',
        'city_region' => 'Sigiriya',
        'status' => 'active',
        'slug' => 'sigiriya',
    ]);

    $publishedPkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Sigiriya Explorer',
        'price' => 15000,
        'status' => 'active',
        'is_active' => true,
    ]);

    $inactiveIsActivePkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Hidden Sigiriya',
        'price' => 12000,
        'status' => 'active',
        'is_active' => false,
    ]);

    $inactiveStatusPkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Sigiriya Ancient',
        'price' => 18000,
        'status' => 'inactive',
        'is_active' => true,
    ]);

    $draftPkg = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Sigiriya Draft',
        'price' => 20000,
        'status' => 'draft',
        'is_active' => true,
    ]);

    $published = TourPackage::published()->get();

    expect($published->pluck('id')->all())->toBe([$publishedPkg->id])
        ->and($published->contains('id', $inactiveIsActivePkg->id))->toBeFalse()
        ->and($published->contains('id', $inactiveStatusPkg->id))->toBeFalse()
        ->and($published->contains('id', $draftPkg->id))->toBeFalse();

    // Verify Destination::publicTourCount()
    expect($destination->publicTourCount())->toBe(1);
});

test('Inquiry::generateReference() matches NT- followed by 8 uppercase alphanumeric characters and 50 calls are unique', function () {
    $ref = Inquiry::generateReference();
    expect($ref)->toMatch('/^NT-[A-Z0-9]{8}$/');

    $references = [];
    for ($i = 0; $i < 50; $i++) {
        $references[] = Inquiry::generateReference();
    }

    expect(count($references))->toBe(50)
        ->and(count(array_unique($references)))->toBe(50);

    foreach ($references as $r) {
        expect($r)->toMatch('/^NT-[A-Z0-9]{8}$/');
    }
});

test('schema check: the new columns exist on destinations, tour_packages, and inquiries', function () {
    $destinationColumns = [
        'slug',
        'region',
        'tagline',
        'best_months',
        'facts',
        'highlights',
        'hero_image',
        'gallery',
        'sort_order',
    ];

    foreach ($destinationColumns as $col) {
        expect(Schema::hasColumn('destinations', $col))
            ->toBeTrue("Column {$col} missing on destinations table");
    }

    $tourPackageColumns = [
        'slug',
        'duration_nights',
        'group_min',
        'itinerary',
        'highlights',
        'tags',
        'departure_months',
        'faqs',
        'sort_order',
    ];

    foreach ($tourPackageColumns as $col) {
        expect(Schema::hasColumn('tour_packages', $col))
            ->toBeTrue("Column {$col} missing on tour_packages table");
    }

    $inquiryColumns = [
        'reference',
        'interest',
        'tour_package_id',
        'destination_id',
        'email',
        'phone',
        'preferred_contact',
        'country',
        'start_date',
        'end_date',
        'flexible_dates',
        'adults',
        'children',
        'child_ages',
        'budget_range',
        'referral_source',
        'privacy_consent_at',
        'marketing_consent_at',
        'ip_hash',
        'user_agent',
        'submitted_at',
    ];

    foreach ($inquiryColumns as $col) {
        expect(Schema::hasColumn('inquiries', $col))
            ->toBeTrue("Column {$col} missing on inquiries table");
    }
});
