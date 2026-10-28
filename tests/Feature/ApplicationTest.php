<?php

test('application is up', function () {
    expect(true)->toBeTrue();
});

test('home page redirects to login', function () {
    $response = $this->get('/');
    $response->assertRedirect(route('login'));
});
