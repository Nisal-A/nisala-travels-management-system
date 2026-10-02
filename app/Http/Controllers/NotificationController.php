<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * Get the notifiable entity for the current user.
     */
    protected function getNotifiable(Request $request)
    {
        $user = $request->user();
        if ($user->hasRole('customer') && $user->customer) {
            return $user->customer;
        }
        return $user;
    }

    /**
     * Display a listing of notifications.
     */
    public function index(Request $request)
    {
        $notifiable = $this->getNotifiable($request);
        $query = $notifiable->notifications();

        if ($request->query('filter') === 'unread') {
            $query->unread();
        }

        $notifications = $query->paginate(15);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filter' => $request->query('filter', 'all'),
        ]);
    }

    /**
     * Get unread notifications count.
     */
    public function unreadCount(Request $request)
    {
        $notifiable = $this->getNotifiable($request);
        return response()->json([
            'count' => $notifiable->unreadNotifications()->count(),
        ]);
    }

    /**
     * Get recent notifications for the dropdown.
     */
    public function recent(Request $request)
    {
        $notifiable = $this->getNotifiable($request);
        return response()->json([
            'notifications' => $notifiable->notifications()->take(5)->get(),
        ]);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notifiable = $this->getNotifiable($request);
        $notification = $notifiable->notifications()->findOrFail($id);
        
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $notifiable = $this->getNotifiable($request);
        $notifiable->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }
}
