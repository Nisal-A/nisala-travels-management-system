<?php

test('application is up', function () {
    expect(true)->toBeTrue();
});

test('home page loads successfully', function () {
    $response = $this->get('/');
    $response->assertStatus(200);
});
