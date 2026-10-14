<?php

use App\Http\Controllers\Api\PublicTourController;
use App\Http\Controllers\InquiryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('public')->group(function () {
    Route::middleware(['public.key', 'throttle:120,1'])->group(function () {
        Route::get('tours', [PublicTourController::class, 'index']);
        Route::get('tours/{slug}', [PublicTourController::class, 'show']);
        Route::get('destinations', [PublicTourController::class, 'destinations']);
    });

    Route::middleware(['public.key', 'throttle:public-inquiry', 'public.honeypot'])->group(function () {
        Route::post('inquiries', [InquiryController::class, 'store']);
    });
});

