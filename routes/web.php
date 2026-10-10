<?php

use App\Http\Controllers\Api\PublicTourController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CustomerDocumentController;
use App\Http\Controllers\CustomerDocumentVerificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DestinationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\GlobalSearchController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Portal\DocumentController;
use App\Http\Controllers\Portal\ProfileController;
use App\Http\Controllers\SavedFilterController;
use App\Http\Controllers\TourPackageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Public/Home');
})->name('home');

Route::get('/reset-password/{token}', function ($token) {
    return Inertia::render('Auth/ResetPassword', ['token' => $token]);
})->name('password.reset');

Route::get('/tours', function () {
    return Inertia::render('Public/Tours/Index');
})->name('tours.index');

Route::get('/tours/{slug}', function ($slug) {
    return Inertia::render('Public/Tours/Show', ['slug' => $slug]);
})->name('tours.show');

Route::get('/contact', function () {
    return Inertia::render('Public/Contact');
})->name('contact');

Route::prefix('api/public')->group(function () {
    Route::get('tours', [PublicTourController::class, 'index']);
    Route::get('tours/featured', [PublicTourController::class, 'featured']);
    Route::get('tours/{slug}', [PublicTourController::class, 'show']);
    Route::get('destinations', [PublicTourController::class, 'destinations']);
});

Route::post('/inquiries', [InquiryController::class, 'store'])
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
    Route::post('/saved-filters', [SavedFilterController::class, 'store'])->name('saved-filters.store');
    Route::delete('/saved-filters/{savedFilter}', [SavedFilterController::class, 'destroy'])->name('saved-filters.destroy');



    // Administrative routes — accessible to all office roles
    Route::middleware('role:super_admin,manager,staff,finance')->group(function () {

        // Global Search
        Route::get('/admin/search', [GlobalSearchController::class, 'search'])->name('admin.search');

        // Notifications
        Route::prefix('admin/notifications')->name('admin.notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unreadCount');
            Route::get('/recent', [NotificationController::class, 'recent'])->name('recent');
            Route::patch('/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('markAsRead');
            Route::post('/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
            Route::delete('/{id}', [NotificationController::class, 'destroy'])->name('destroy');
        });

        // Calendar
        Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
        Route::get('/admin/calendar/events', [CalendarController::class, 'events'])->name('calendar.events');

        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [\App\Http\Controllers\SettingsController::class, 'index'])->name('index');
            Route::post('/general', [\App\Http\Controllers\SettingsController::class, 'updateGeneral'])->name('general.update');
            Route::put('/appearance', [\App\Http\Controllers\SettingsController::class, 'updateAppearance'])->name('appearance.update');
            Route::put('/localization', [\App\Http\Controllers\SettingsController::class, 'updateLocalization'])->name('localization.update');
            Route::put('/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications'])->name('notifications.update');
            Route::put('/security', [\App\Http\Controllers\SettingsController::class, 'updateSecurity'])->name('security.update');
            Route::delete('/security/sessions', [\App\Http\Controllers\SettingsController::class, 'destroySessions'])->name('security.sessions.destroy');
        });
        
        // My Profile
        Route::prefix('profile')->name('profile.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('edit');
            Route::patch('/', [\App\Http\Controllers\ProfileController::class, 'update'])->name('update');
            Route::post('/avatar', [\App\Http\Controllers\ProfileController::class, 'updateAvatar'])->name('avatar.update');
            Route::delete('/avatar', [\App\Http\Controllers\ProfileController::class, 'destroyAvatar'])->name('avatar.destroy');
            Route::put('/password', [\App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('password.update');
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


    });

    // ==============================
    // Super Admin + Manager
    // ==============================
    Route::middleware('role:super_admin,manager')->group(function () {
        Route::resource('employees', EmployeeController::class)->except(['create', 'edit']);
        Route::patch('employees/{employee}/activate', [EmployeeController::class, 'activate'])->name('employees.activate');
        Route::patch('employees/{employee}/deactivate', [EmployeeController::class, 'deactivate'])->name('employees.deactivate');
        Route::post('employees/{employee}/reset-password', [EmployeeController::class, 'resetPassword'])->name('employees.reset-password');
    });

    // ==============================
    // Super Admin + Manager + Staff (Operational)
    // ==============================
    Route::middleware('role:super_admin,manager,staff')->group(function () {
        Route::resource('customers', CustomerController::class);
        Route::post('customers/{customer}/documents', [CustomerDocumentController::class, 'store'])->name('customers.documents.store');
        Route::get('customers/{customer}/documents/{document}/download', [CustomerDocumentController::class, 'download'])->name('customers.documents.download');
        Route::patch('customers/{customer}/documents/{document}/verify', [CustomerDocumentVerificationController::class, 'verify'])->name('customers.documents.verify');
        Route::patch('customers/{customer}/documents/{document}/reject', [CustomerDocumentVerificationController::class, 'reject'])->name('customers.documents.reject');

        Route::prefix('documents')->name('documents.')->group(function () {
            Route::get('/', fn () => Inertia::render('Documents/Index'))->name('index');
        });

        Route::resource('destinations', DestinationController::class);
        Route::resource('tours', TourPackageController::class);

        Route::get('admin/customers/search', [CustomerController::class, 'search'])->name('customers.search');

        Route::post('bookings/draft', [BookingController::class, 'saveDraft'])->name('bookings.draft.save');
        Route::get('bookings/draft', [BookingController::class, 'getDraft'])->name('bookings.draft.get');
        Route::delete('bookings/draft', [BookingController::class, 'deleteDraft'])->name('bookings.draft.delete');

        Route::resource('bookings', BookingController::class);
        Route::patch('bookings/{booking}/status', [BookingController::class, 'changeStatus'])->name('bookings.status');
        Route::post('bookings/{booking}/notes', [BookingController::class, 'addNote'])->name('bookings.notes.store');
        Route::patch('bookings/{booking}/assign', [BookingController::class, 'assignStaff'])->name('bookings.assign');
        Route::post('bookings/{id}/restore', [BookingController::class, 'restore'])->name('bookings.restore');
    });

    // ==============================
    // Super Admin + Manager + Finance (Financial)
    // ==============================
    Route::middleware('role:super_admin,manager,finance')->group(function () {
        // Payments Management (NT-011)
        Route::resource('payments', PaymentController::class)->only(['index', 'store', 'destroy']);

        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', [\App\Http\Controllers\ReportController::class, 'index'])->name('index');
        });
    });

    // ==============================
    // Customer Portal
    // ==============================
    // Customers access their own data through the portal. Server-side
    // policies further restrict them to their own records only.
    Route::middleware(['role:customer', 'customer'])->prefix('portal')->name('portal.')->group(function () {
        Route::get('/', [App\Http\Controllers\Portal\DashboardController::class, 'index'])->name('dashboard');

        Route::get('/bookings', [App\Http\Controllers\Portal\BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [App\Http\Controllers\Portal\BookingController::class, 'show'])->name('bookings.show');
        Route::get('/bookings/{booking}/itinerary', [App\Http\Controllers\Portal\BookingController::class, 'itinerary'])->name('bookings.itinerary');

        Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
        Route::post('/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [App\Http\Controllers\NotificationController::class, 'index'])->name('index');
            Route::get('/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount'])->name('unreadCount');
            Route::get('/recent', [App\Http\Controllers\NotificationController::class, 'recent'])->name('recent');
            Route::patch('/{id}/mark-as-read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('markAsRead');
            Route::post('/mark-all-as-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('markAllAsRead');
            Route::delete('/{id}', [App\Http\Controllers\NotificationController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/notifications', [\App\Http\Controllers\NotificationSettingsController::class, 'index'])->name('notifications.index');
            Route::put('/notifications', [\App\Http\Controllers\NotificationSettingsController::class, 'update'])->name('notifications.update');
        });

        Route::get('/payments', [App\Http\Controllers\Portal\PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/{payment}/receipt', [App\Http\Controllers\Portal\PaymentController::class, 'receipt'])->name('payments.receipt');

        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('/profile/sessions', [ProfileController::class, 'logoutOtherBrowserSessions'])->name('profile.sessions.destroy');
    });
});

if (app()->environment('local')) {
    Route::get('/dev/styleguide', function () {
        return Inertia::render('Dev/Styleguide');
    });

    Route::get('/admin/dev/emails', [\App\Http\Controllers\Admin\EmailPreviewController::class, 'index']);
    Route::get('/admin/dev/emails/{type}', [\App\Http\Controllers\Admin\EmailPreviewController::class, 'preview']);
}
