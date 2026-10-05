<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CustomerDocument;
use App\Models\Inquiry;
use App\Models\Payment;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\DocumentRejectedNotification;
use App\Notifications\DocumentUploadedNotification;
use App\Notifications\DocumentVerifiedNotification;
use App\Notifications\NewInquiryNotification;
use App\Notifications\PaymentOverdueNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Notifications\TripReminderNotification;
use App\Models\User;

class EmailPreviewController extends Controller
{
    public function index()
    {
        if (app()->environment() !== 'local') {
            abort(404);
        }

        $html = '<h1>Email Preview Tool</h1><ul>';
        $html .= '<li><a href="/admin/dev/emails/booking-confirmed">Booking Confirmed</a></li>';
        $html .= '<li><a href="/admin/dev/emails/payment-receipt">Payment Receipt</a></li>';
        $html .= '<li><a href="/admin/dev/emails/document-rejected">Document Rejected</a></li>';
        $html .= '<li><a href="/admin/dev/emails/document-verified">Document Verified</a></li>';
        $html .= '<li><a href="/admin/dev/emails/trip-reminder">Trip Reminder</a></li>';
        $html .= '<li><a href="/admin/dev/emails/payment-overdue">Payment Overdue</a></li>';
        $html .= '<li><a href="/admin/dev/emails/new-inquiry">New Inquiry (Staff)</a></li>';
        $html .= '<li><a href="/admin/dev/emails/document-uploaded">Document Uploaded (Staff)</a></li>';
        $html .= '</ul>';
        return $html;
    }

    public function preview($type)
    {
        if (app()->environment() !== 'local') {
            abort(404);
        }

        // Mock a user
        $user = new User(['first_name' => 'John', 'last_name' => 'Doe', 'email' => 'john@example.com']);
        $user->id = 1;

        switch ($type) {
            case 'booking-confirmed':
                $booking = Booking::with('tourPackage.destination')->first() ?? new Booking([
                    'id' => 1,
                    'booking_reference' => 'BK-12345',
                    'start_date' => now()->addDays(20),
                    'end_date' => now()->addDays(27),
                    'total_price' => 150000,
                    'paid_amount' => 50000,
                    'currency' => 'LKR'
                ]);
                return (new BookingConfirmedNotification($booking))->toMail($user)->render();

            case 'payment-receipt':
                $payment = Payment::with('booking')->first() ?? new Payment([
                    'id' => 1,
                    'amount' => 50000,
                    'currency' => 'LKR',
                    'payment_date' => now(),
                    'payment_method' => 'card',
                    'reference_number' => 'REC-98765',
                ]);
                return (new PaymentReceivedNotification($payment))->toMail($user)->render();

            case 'document-rejected':
                $document = CustomerDocument::with(['documentType', 'traveler'])->first() ?? new CustomerDocument([
                    'id' => 1,
                    'verification_notes' => 'Image is too blurry. Please upload a scanned copy.',
                ]);
                return (new DocumentRejectedNotification($document))->toMail($user)->render();

            case 'document-verified':
                $document = CustomerDocument::with(['documentType', 'traveler'])->first() ?? new CustomerDocument([
                    'id' => 1,
                ]);
                return (new DocumentVerifiedNotification($document))->toMail($user)->render();

            case 'trip-reminder':
                $booking = Booking::with('tourPackage.destination')->first() ?? new Booking([
                    'id' => 1,
                    'start_date' => now()->addDays(7),
                ]);
                return (new TripReminderNotification($booking, 7))->toMail($user)->render();

            case 'payment-overdue':
                // For simplicity, reusing payment mock as installment
                $installment = Payment::with('booking')->first() ?? new Payment([
                    'id' => 1,
                    'amount' => 15000,
                    'currency' => 'LKR',
                    'due_date' => now()->subDays(2),
                    'booking_id' => 1,
                ]);
                return (new PaymentOverdueNotification($installment))->toMail($user)->render();

            case 'new-inquiry':
                $lead = Inquiry::first() ?? new Inquiry([
                    'id' => 1,
                    'first_name' => 'Jane',
                    'last_name' => 'Smith',
                    'email' => 'jane@example.com',
                    'phone' => '+94 77 123 4567',
                    'created_at' => now(),
                ]);
                return (new NewInquiryNotification($lead))->toMail($user)->render();

            case 'document-uploaded':
                $document = CustomerDocument::with(['customer', 'traveler', 'documentType'])->first() ?? new CustomerDocument([
                    'id' => 1,
                    'created_at' => now(),
                ]);
                return (new DocumentUploadedNotification($document))->toMail($user)->render();

            default:
                abort(404);
        }
    }
}
