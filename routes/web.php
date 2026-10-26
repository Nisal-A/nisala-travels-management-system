<?php

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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Portal\DocumentController;
use App\Http\Controllers\Portal\ProfileController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\SavedFilterController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\StaffProfileController;
use App\Http\Controllers\TourPackageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

require_once app_path('Models/AppSetting.php');

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
|
| Routes accessible to everyone (guests and authenticated users alike).
| These render public-facing pages wrapped with PublicLayout.
|
*/
Route::get('/', [PublicController::class, 'home'])->name('home');

Route::get('/our-destinations', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'Our Destinations',
    'description' => 'Explore our handpicked travel destinations across Thailand, India, and the Maldives.',
]))->name('public.destinations');

Route::get('/our-tours', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'Our Tours',
    'description' => 'Browse our curated collection of tour packages designed for unforgettable experiences.',
]))->name('public.tours');

Route::get('/our-tours/{slug}', fn (string $slug) => Inertia::render('Public/Placeholder', [
    'title' => 'Tour Details',
    'description' => 'Detailed information and itinerary for this tour package.',
    'slug' => $slug,
]))->name('public.tours.show');

Route::redirect('/memories', '/about#memories', 301);
Route::get('/about', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'About Us',
    'description' => 'Learn about Nisala Travels, our story, and our journey.',
]))->name('public.about');

Route::get('/travel-guides', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'Travel Guides',
    'description' => 'Expert tips, packing advice, and local insights for your next adventure.',
]))->name('public.travel-guides');

Route::match(['get', 'post'], '/contact', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'Contact Us',
    'description' => 'Get in touch with our travel experts to plan your customized journey.',
]))->name('public.contact');

Route::get('/privacy-policy', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'Privacy Policy',
    'description' => 'How we collect, use, and protect your personal information.',
]))->name('public.privacy-policy');

Route::get('/terms', fn () => Inertia::render('Public/Placeholder', [
    'title' => 'Terms & Conditions',
    'description' => 'Our terms of service, booking conditions, and policies.',
]))->name('public.terms');


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
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::match(['put', 'post'], '/', [SettingsController::class, 'update'])->name('update');
            Route::post('/clear-cache', [SettingsController::class, 'clearPublicCache'])->name('clear-cache');
            Route::get('/notifications', [\App\Http\Controllers\NotificationSettingsController::class, 'index'])->name('notifications.index');
            Route::put('/notifications', [\App\Http\Controllers\NotificationSettingsController::class, 'update'])->name('notifications.update');
        });
    });

    // ==============================
    // Super Admin + Manager
    // ==============================
    Route::middleware('role:super_admin,manager')->group(function () {
        Route::resource('employees', EmployeeController::class);

        // Memories Management (TASK P10)
        Route::prefix('admin/memories')->name('admin.memories.')->group(function () {
            Route::get('/', [\App\Http\Controllers\Admin\MemoryYearController::class, 'index'])->name('index');
            Route::get('/create', [\App\Http\Controllers\Admin\MemoryYearController::class, 'create'])->name('create');
            Route::post('/', [\App\Http\Controllers\Admin\MemoryYearController::class, 'store'])->name('store');
            Route::get('/{memoryYear}/edit', [\App\Http\Controllers\Admin\MemoryYearController::class, 'edit'])->name('edit');
            Route::put('/{memoryYear}', [\App\Http\Controllers\Admin\MemoryYearController::class, 'update'])->name('update');
            Route::delete('/{memoryYear}', [\App\Http\Controllers\Admin\MemoryYearController::class, 'destroy'])->name('destroy');
            Route::patch('/{memoryYear}/toggle-publish', [\App\Http\Controllers\Admin\MemoryYearController::class, 'togglePublish'])->name('toggle-publish');
            Route::post('/{memoryYear}/media', [\App\Http\Controllers\Admin\MemoryYearController::class, 'storeMedia'])->name('media.store');
            Route::delete('/{memoryYear}/media/{media}', [\App\Http\Controllers\Admin\MemoryYearController::class, 'destroyMedia'])->name('media.destroy');
        });
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
        // Inquiries admin routes
        Route::get('admin/inquiries', [\App\Http\Controllers\Admin\InquiryAdminController::class, 'index'])->name('admin.inquiries.index');
        Route::get('admin/inquiries/{inquiry}', [\App\Http\Controllers\Admin\InquiryAdminController::class, 'show'])->name('admin.inquiries.show');
        Route::patch('admin/inquiries/{inquiry}/status', [\App\Http\Controllers\Admin\InquiryAdminController::class, 'updateStatus'])->name('admin.inquiries.status');
        Route::patch('admin/inquiries/{inquiry}/assign', [\App\Http\Controllers\Admin\InquiryAdminController::class, 'assign'])->name('admin.inquiries.assign');
    });

    // ==============================
    // Super Admin + Manager + Finance (Financial)
    // ==============================
    Route::middleware('role:super_admin,manager,finance')->group(function () {
        // Payments Management (NT-011)
        Route::resource('payments', PaymentController::class)->only(['index', 'store', 'destroy']);

        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('/', fn () => Inertia::render('Reports/Index'))->name('index');
        });
    });

    // ==============================
    // Staff Profile (super_admin, manager, staff, finance)
    // ==============================
    Route::middleware('role:super_admin,manager,staff,finance')->group(function () {
        Route::get('/profile', [StaffProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [StaffProfileController::class, 'update'])->name('profile.update');
        Route::put('/profile/password', [StaffProfileController::class, 'updatePassword'])->name('profile.password.update');
        Route::delete('/profile/sessions', [StaffProfileController::class, 'logoutOtherBrowserSessions'])->name('profile.sessions.destroy');
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
