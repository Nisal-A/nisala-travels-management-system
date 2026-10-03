<?php

$listeners = [
    'SendBookingConfirmedNotification' => [
        'event' => '\App\Events\BookingConfirmed',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getCustomer(\$event->booking->customer), new \App\Notifications\BookingConfirmedNotification(\$event->booking));"
    ],
    'SendPaymentReceivedNotification' => [
        'event' => '\App\Events\PaymentReceived',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getCustomer(\$event->payment->customer), new \App\Notifications\PaymentReceivedNotification(\$event->payment));"
    ],
    'SendPaymentReceivedStaffNotification' => [
        'event' => '\App\Events\PaymentReceived',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getStaffByRole(['Finance', 'Admin']), new \App\Notifications\PaymentReceivedStaffNotification(\$event->payment));"
    ],
    'SendDocumentUploadedNotification' => [
        'event' => '\App\Events\DocumentUploaded',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getStaffByRole(['Admin', 'Manager']), new \App\Notifications\DocumentUploadedNotification(\$event->document));"
    ],
    'SendDocumentVerifiedNotification' => [
        'event' => '\App\Events\DocumentVerified',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getCustomer(\$event->document->customer), new \App\Notifications\DocumentVerifiedNotification(\$event->document));"
    ],
    'SendDocumentRejectedNotification' => [
        'event' => '\App\Events\DocumentRejected',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getCustomer(\$event->document->customer), new \App\Notifications\DocumentRejectedNotification(\$event->document));"
    ],
    'SendNewInquiryNotification' => [
        'event' => '\App\Events\InquirySubmitted',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getStaffByRole(['Sales', 'Admin']), new \App\Notifications\NewInquiryNotification(\$event->lead));"
    ],
    'SendTripReminderNotification' => [
        'event' => '\App\Events\TripReminderDue',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getCustomer(\$event->booking->customer), new \App\Notifications\TripReminderNotification(\$event->booking));"
    ],
    'SendPaymentOverdueNotification' => [
        'event' => '\App\Events\PaymentOverdue',
        'logic' => "Notification::send(\App\Services\NotificationRecipients::getCustomer(\$event->installment->booking->customer), new \App\Notifications\PaymentOverdueNotification(\$event->installment));"
    ],
];

$dir = __DIR__ . '/../app/Listeners';
if (!is_dir($dir)) mkdir($dir, 0755, true);

foreach ($listeners as $class => $def) {
    $eventClass = $def['event'];
    
    $code = "<?php\n\nnamespace App\Listeners;\n\n";
    $code .= "use {$eventClass};\n";
    $code .= "use Illuminate\Contracts\Queue\ShouldQueue;\n";
    $code .= "use Illuminate\Queue\InteractsWithQueue;\n";
    $code .= "use Illuminate\Support\Facades\Notification;\n\n";
    $code .= "class {$class} implements ShouldQueue\n{\n";
    $code .= "    use InteractsWithQueue;\n\n";
    $code .= "    public function handle({$eventClass} \$event): void\n    {\n";
    $code .= "        " . $def['logic'] . "\n    }\n}\n";
    
    file_put_contents("{$dir}/{$class}.php", $code);
}
echo "Listeners generated.\n";
