<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    protected function getGroupTypes($group)
    {
        return match ($group) {
            'Bookings' => ['App\Notifications\BookingConfirmedNotification', 'App\Notifications\TripReminderNotification'],
            'Payments' => [
                'App\Notifications\PaymentReceivedNotification',
                'App\Notifications\PaymentOverdueNotification',
                'App\Notifications\PaymentReceivedStaffNotification',
                'App\Notifications\RefundStatusNotification',
            ],
            'Documents' => ['App\Notifications\DocumentRejectedNotification', 'App\Notifications\DocumentVerifiedNotification', 'App\Notifications\DocumentUploadedNotification'],
            'Leads' => ['App\Notifications\NewInquiryNotification', 'App\Notifications\InquirySubmittedNotification'],
            default => [],
        };
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = $user->notifications();

        if ($request->query('filter') === 'unread') {
            $query->unread();
        }

        if ($group = $request->query('group')) {
            if ($group !== 'All') {
                $types = $this->getGroupTypes($group);
                $query->whereIn('type', $types);
            }
        }

        $notifications = $query->paginate(15);

        $view = $user->hasRole('customer') ? 'Portal/Notifications' : 'Notifications/Index';

        return Inertia::render($view, [
            'notifications' => $notifications,
            'filter' => $request->query('filter', 'all'),
            'group' => $request->query('group', 'All'),
        ]);
    }

    public function unreadCount(Request $request)
    {
        $count = cache()->remember('unread_notifications_count_' . $request->user()->id, 10, function () use ($request) {
            return $request->user()->unreadNotifications()->count();
        });

        return response()->json(['count' => $count]);
    }

    public function recent(Request $request)
    {
        return response()->json([
            'notifications' => $request->user()->notifications()->take(8)->get(),
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();
        cache()->forget('unread_notifications_count_' . $request->user()->id);

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        cache()->forget('unread_notifications_count_' . $request->user()->id);

        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->delete();
        cache()->forget('unread_notifications_count_' . $request->user()->id);

        return response()->json(['success' => true]);
    }
}
