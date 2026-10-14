<?php

use App\Jobs\RevalidateNextJs;
use App\Models\Destination;
use App\Models\TourPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

test('saving a tour dispatches RevalidateNextJs with tours', function () {
    Queue::fake();

    $destination = Destination::create([
        'slug' => 'sri-lanka-test',
        'country' => 'Sri Lanka',
        'city_region' => 'Colombo',
        'status' => 'active',
    ]);

    $tour = TourPackage::create([
        'destination_id' => $destination->id,
        'package_name' => 'Sample Tour',
        'slug' => 'sample-tour',
        'price' => 50000,
        'status' => 'active',
        'is_active' => true,
    ]);

    Queue::assertPushed(RevalidateNextJs::class, function ($job) {
        return $job->tags === ['tours'];
    });
});

test('saving a destination dispatches RevalidateNextJs with destinations', function () {
    Queue::fake();

    Destination::create([
        'slug' => 'maldives-test',
        'country' => 'Maldives',
        'city_region' => 'Male',
        'status' => 'active',
    ]);

    Queue::assertPushed(RevalidateNextJs::class, function ($job) {
        return $job->tags === ['destinations'];
    });
});

test('the job retries when the response is 500 and Log::spy confirms the body is not logged', function () {
    Config::set('services.nextjs.revalidate_url', 'https://frontend.example.com/api/revalidate');
    Config::set('services.nextjs.revalidate_secret', 'super-secret-token-xyz');

    Http::fake([
        'https://frontend.example.com/api/revalidate' => Http::response(['error' => 'Server error'], 500),
    ]);

    Log::spy();

    $job = new RevalidateNextJs(['tours']);

    // Verify retry properties
    expect($job->tries)->toBe(3);
    expect($job->backoff())->toBe([10, 60, 300]);

    // Executing the job with 500 response throws an exception to trigger queue retry
    try {
        $job->handle();
        $this->fail('Expected exception was not thrown');
    } catch (\Throwable $e) {
        expect($e)->toBeInstanceOf(\RuntimeException::class)
            ->and($e->getMessage())->toContain('500');
    }

    // Verify Log::spy confirms status code logged, but secret and body are not logged
    Log::shouldHaveReceived('error')
        ->once()
        ->withArgs(function ($message) {
            expect($message)->toContain('500')
                ->and($message)->not->toContain('super-secret-token-xyz')
                ->and($message)->not->toContain('"tags"')
                ->and($message)->not->toContain('{"tags":')
                ->and($message)->not->toContain('tours');

            return true;
        });
});

test('if revalidate URL is empty, job logs info and returns without error', function () {
    Config::set('services.nextjs.revalidate_url', '');
    Config::set('services.nextjs.revalidate_secret', 'some-secret');

    Http::fake();
    Log::spy();

    $job = new RevalidateNextJs(['destinations']);
    $job->handle();

    Http::assertNothingSent();

    Log::shouldHaveReceived('info')
        ->once()
        ->withArgs(function ($message) {
            expect($message)->toContain('empty');

            return true;
        });
});
