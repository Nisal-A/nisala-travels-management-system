<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
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

    // Dashboard — accessible to all authenticated users.
    // The controller determines which dashboard variant and data to serve based on role.
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Notifications — accessible to all office roles
    Route::middleware('role:super_admin,manager,staff,finance')->group(function () {
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', fn () => Inertia::render('Notifications/Index'))->name('index');
        });
    });

    // ------------------------------------------------------------------
    // Role-Protected Application Routes (NT-005.2 / NT-005.4)
    // ------------------------------------------------------------------
    // Each route group is protected by the 'role' middleware, which checks
    // the authenticated user's Spatie role(s) server-side. Unauthorized
    // users receive a 403 Forbidden response.
    //
    // Navigation visibility in the frontend is a UX convenience only —
    // these middleware checks are the actual security boundary.
    // ------------------------------------------------------------------

    // ==============================
    // Super Admin Only
    // ==============================
    Route::middleware('role:super_admin')->group(function () {
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
        });

        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', fn () => Inertia::render('Settings/Index'))->name('index');
        });
    });

    // ==============================
    // Super Admin + Manager
    // ==============================
    Route::middleware('role:super_admin,manager')->group(function () {
        Route::prefix('employees')->name('employees.')->group(function () {
            Route::get('/', fn () => Inertia::render('Employees/Index'))->name('index');
        });
    });

    // ==============================
    // Super Admin + Manager + Staff (Operational)
    // ==============================
    Route::middleware('role:super_admin,manager,staff')->group(function () {
        Route::resource('customers', \App\Http\Controllers\CustomerController::class);
        Route::post('customers/{customer}/documents', [\App\Http\Controllers\CustomerDocumentController::class, 'store'])->name('customers.documents.store');
        Route::get('customers/{customer}/documents/{document}/download', [\App\Http\Controllers\CustomerDocumentController::class, 'download'])->name('customers.documents.download');
        Route::patch('customers/{customer}/documents/{document}/verify', [\App\Http\Controllers\CustomerDocumentVerificationController::class, 'verify'])->name('customers.documents.verify');
        Route::patch('customers/{customer}/documents/{document}/reject', [\App\Http\Controllers\CustomerDocumentVerificationController::class, 'reject'])->name('customers.documents.reject');

        Route::prefix('documents')->name('documents.')->group(function () {
            Route::get('/', fn () => Inertia::render('Documents/Index'))->name('index');
        });


        Route::resource('tour-packages', \App\Http\Controllers\TourPackageController::class);
        Route::patch('tour-packages/{tour_package}/status', [\App\Http\Controllers\TourPackageController::class, 'changeStatus'])->name('tour-packages.status');
        Route::post('tour-packages/{id}/restore', [\App\Http\Controllers\TourPackageController::class, 'restore'])->name('tour-packages.restore');

        Route::prefix('bookings')->name('bookings.')->group(function () {
            Route::get('/', fn () => Inertia::render('Bookings/Index'))->name('index');
        });
    });

    // ==============================
    // Super Admin + Manager + Finance (Financial)
    // ==============================
    Route::middleware('role:super_admin,manager,finance')->group(function () {
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', fn () => Inertia::render('Payments/Index'))->name('index');
        });

        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', fn () => Inertia::render('Reports/Index'))->name('index');
        });
    });

    // ==============================
    // Customer Portal
    // ==============================
    // Customers access their own data through the portal. Server-side
    // policies further restrict them to their own records only.
    Route::middleware('role:customer')->prefix('portal')->name('portal.')->group(function () {
        Route::get('/', fn () => Inertia::render('Portal/Dashboard'))->name('dashboard');
        Route::get('/bookings', fn () => Inertia::render('Portal/Bookings'))->name('bookings');
        Route::get('/documents', fn () => Inertia::render('Portal/Documents'))->name('documents');
        Route::get('/payments', fn () => Inertia::render('Portal/Payments'))->name('payments');
    });
});
