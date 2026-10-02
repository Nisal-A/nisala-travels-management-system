<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/tours', function () {
    return Inertia::render('Public/Tours/Index');
})->name('tours.index');

Route::get('/tours/{slug}', function ($slug) {
    return Inertia::render('Public/Tours/Show', ['slug' => $slug]);
})->name('tours.show');

Route::prefix('api/public')->group(function () {
    Route::get('tours', [\App\Http\Controllers\Api\PublicTourController::class, 'index']);
    Route::get('tours/featured', [\App\Http\Controllers\Api\PublicTourController::class, 'featured']);
    Route::get('tours/{slug}', [\App\Http\Controllers\Api\PublicTourController::class, 'show']);
    Route::get('destinations', [\App\Http\Controllers\Api\PublicTourController::class, 'destinations']);
});

Route::post('/inquiries', [\App\Http\Controllers\InquiryController::class, 'store'])
    ->middleware('throttle:5,60')
    ->name('inquiries.store');

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

    // Saved Filters — accessible to all authenticated users
    Route::post('/saved-filters', [\App\Http\Controllers\SavedFilterController::class, 'store'])->name('saved-filters.store');
    Route::delete('/saved-filters/{savedFilter}', [\App\Http\Controllers\SavedFilterController::class, 'destroy'])->name('saved-filters.destroy');

    // Notifications — accessible to all office roles
    Route::middleware('role:super_admin,manager,staff,finance')->group(function () {
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', fn () => Inertia::render('Notifications/Index'))->name('index');
        });
        
        // Global Search
        Route::get('/admin/search', [\App\Http\Controllers\GlobalSearchController::class, 'search'])->name('admin.search');

        // Calendar
        Route::get('/calendar', [\App\Http\Controllers\CalendarController::class, 'index'])->name('calendar');
        Route::get('/admin/calendar/events', [\App\Http\Controllers\CalendarController::class, 'events'])->name('calendar.events');
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
        Route::resource('employees', \App\Http\Controllers\EmployeeController::class);
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

        Route::resource('destinations', \App\Http\Controllers\DestinationController::class);
        Route::resource('tours', \App\Http\Controllers\TourPackageController::class);

        Route::get('admin/customers/search', [\App\Http\Controllers\CustomerController::class, 'search'])->name('customers.search');

        Route::post('bookings/draft', [\App\Http\Controllers\BookingController::class, 'saveDraft'])->name('bookings.draft.save');
        Route::get('bookings/draft', [\App\Http\Controllers\BookingController::class, 'getDraft'])->name('bookings.draft.get');
        Route::delete('bookings/draft', [\App\Http\Controllers\BookingController::class, 'deleteDraft'])->name('bookings.draft.delete');

        Route::resource('bookings', \App\Http\Controllers\BookingController::class);
        Route::patch('bookings/{booking}/status', [\App\Http\Controllers\BookingController::class, 'changeStatus'])->name('bookings.status');
        Route::post('bookings/{booking}/notes', [\App\Http\Controllers\BookingController::class, 'addNote'])->name('bookings.notes.store');
        Route::patch('bookings/{booking}/assign', [\App\Http\Controllers\BookingController::class, 'assignStaff'])->name('bookings.assign');
        Route::post('bookings/{id}/restore', [\App\Http\Controllers\BookingController::class, 'restore'])->name('bookings.restore');
    });

    // ==============================
    // Super Admin + Manager + Finance (Financial)
    // ==============================
    Route::middleware('role:super_admin,manager,finance')->group(function () {
        // Payments Management (NT-011)
        Route::resource('payments', \App\Http\Controllers\PaymentController::class)->only(['index', 'store', 'destroy']);

        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', fn () => Inertia::render('Reports/Index'))->name('index');
        });
    });

    // ==============================
    // Customer Portal
    // ==============================
    // Customers access their own data through the portal. Server-side
    // policies further restrict them to their own records only.
    Route::middleware(['role:customer', 'customer'])->prefix('portal')->name('portal.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Portal\DashboardController::class, 'index'])->name('dashboard');
        
        Route::get('/bookings', [\App\Http\Controllers\Portal\BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [\App\Http\Controllers\Portal\BookingController::class, 'show'])->name('bookings.show');
        Route::get('/bookings/{booking}/itinerary', [\App\Http\Controllers\Portal\BookingController::class, 'itinerary'])->name('bookings.itinerary');
        
        Route::get('/documents', [\App\Http\Controllers\Portal\DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents', [\App\Http\Controllers\Portal\DocumentController::class, 'store'])->name('documents.store');
        Route::delete('/documents/{document}', [\App\Http\Controllers\Portal\DocumentController::class, 'destroy'])->name('documents.destroy');
        
        Route::get('/payments', [\App\Http\Controllers\Portal\PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}/receipt', [\App\Http\Controllers\Portal\PaymentController::class, 'receipt'])->name('payments.receipt');
        
        Route::get('/profile', [\App\Http\Controllers\Portal\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [\App\Http\Controllers\Portal\ProfileController::class, 'update'])->name('profile.update');
        Route::put('/password', [\App\Http\Controllers\Portal\ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/profile/sessions', [\App\Http\Controllers\Portal\ProfileController::class, 'logoutOtherBrowserSessions'])->name('profile.sessions.destroy');
    });
});

if (app()->environment('local')) {
    Route::get('/dev/styleguide', function () {
        return Inertia::render('Dev/Styleguide');
    });
}
