<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

/*
|--------------------------------------------------------------------------
| Guest Routes
|--------------------------------------------------------------------------
|
| Routes accessible only to unauthenticated users. Authenticated users
| will be redirected to the dashboard.
|
*/
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
|
| Routes that require an authenticated user with an active account.
| The 'active' middleware ensures suspended/inactive users are logged out.
|
*/
Route::middleware(['auth', 'active'])->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // ----------------------------------------------------------------------
    // Protected Application Routes (NT-004.6)
    // ----------------------------------------------------------------------
    // The following route groups are established to prepare for future
    // modules. Being inside this group ensures they are all protected by
    // the 'auth' and 'active' middleware, preventing unauthenticated access.

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::get('/', fn () => 'Admin Dashboard Placeholder')->name('dashboard');
    });

    Route::prefix('customers')->name('customers.')->group(function () {
        Route::get('/', fn () => 'Customers Placeholder')->name('index');
    });

    Route::prefix('documents')->name('documents.')->group(function () {
        Route::get('/', fn () => 'Documents Placeholder')->name('index');
    });

    Route::prefix('tours')->name('tours.')->group(function () {
        Route::get('/', fn () => 'Tours Placeholder')->name('index');
    });

    Route::prefix('bookings')->name('bookings.')->group(function () {
        Route::get('/', fn () => 'Bookings Placeholder')->name('index');
    });

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::get('/', fn () => 'Payments Placeholder')->name('index');
    });

    Route::prefix('employees')->name('employees.')->group(function () {
        Route::get('/', fn () => 'Employees Placeholder')->name('index');
    });

    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', fn () => 'Reports Placeholder')->name('index');
    });

    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', fn () => 'Settings Placeholder')->name('index');
    });
});
