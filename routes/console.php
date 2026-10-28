<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('notifications:trip-reminders')->dailyAt('08:00')->timezone('Asia/Colombo');

Schedule::command('rates:refresh')->dailyAt('06:00')->timezone('Asia/Colombo');
Schedule::command('rates:refresh')->dailyAt('14:00')->timezone('Asia/Colombo');
