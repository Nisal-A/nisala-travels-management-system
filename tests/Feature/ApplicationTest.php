<?php

test('application is up', function () {
    expect(true)->toBeTrue();
});

test('root route redirects guests to login', function () {
    $response = $this->get('/');
    $response->assertRedirect('/login');
});
