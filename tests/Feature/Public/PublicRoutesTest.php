<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(RefreshDatabase::class);

beforeEach(function () {
    config(['services.nisala_web.key' => 'test-valid-api-key']);
});

test('get api public tours with no key returns 401', function () {
    $response = $this->getJson('/api/public/tours');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public tours with wrong key returns 401', function () {
    $response = $this->withHeader('X-Nisala-Key', 'wrong-key')->getJson('/api/public/tours');

    $response->assertStatus(401)
        ->assertJson(['message' => 'Unauthorized']);
});

test('get api public tours with empty key in config returns 503', function () {
    config(['services.nisala_web.key' => '']);

    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->getJson('/api/public/tours');

    $response->assertStatus(503)
        ->assertJson(['message' => 'Service unavailable']);
});

test('get api public tours with correct key returns 200', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->getJson('/api/public/tours');

    $response->assertStatus(200);
});

test('post api public inquiries with correct key and website filled returns 201 with reference and stores no inquiry', function () {
    $response = $this->withHeader('X-Nisala-Key', 'test-valid-api-key')->postJson('/api/public/inquiries', [
        'website' => 'bot-value',
        'name' => 'Spam Bot',
        'email' => 'bot@example.com',
    ]);

    $response->assertStatus(201);
    expect($response->json('reference'))->toMatch('/^NT-[A-Z0-9]{8}$/');

    if (Schema::hasTable('inquiries')) {
        $this->assertDatabaseCount('inquiries', 0);
    }
    if (Schema::hasTable('customers')) {
        $this->assertDatabaseCount('customers', 0);
    }
});

test('post inquiries web route returns 404', function () {
    $response = $this->postJson('/inquiries', []);

    $response->assertStatus(404);
});

test('get / redirects to /dashboard', function () {
    $response = $this->get('/');

    $response->assertRedirect('/dashboard');
});

test('get /our-tours returns 404', function () {
    $response = $this->get('/our-tours');

    $response->assertStatus(404);
});
