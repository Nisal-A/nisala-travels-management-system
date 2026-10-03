<?php

$notifications = [
    'Customer' => [
        'BookingConfirmedNotification' => [
            'model' => 'App\Models\Booking',
            'var' => 'booking',
            'title' => '"Booking Confirmed"',
            'body' => '"Your booking (Ref: " . $this->booking->booking_reference . ") has been confirmed."',
            'url' => 'config("app.url") . "/portal/bookings/" . $this->booking->id',
            'icon' => '"check-circle"',
            'severity' => '"success"',
        ],
        'PaymentReceivedNotification' => [
            'model' => 'App\Models\Payment',
            'var' => 'payment',
            'title' => '"Payment Received"',
            'body' => '"We have received your payment of " . number_format($this->payment->amount, 2) . " " . $this->payment->currency . "."',
            'url' => 'config("app.url") . "/portal/payments/" . $this->payment->id',
            'icon' => '"credit-card"',
            'severity' => '"info"',
        ],
        'DocumentRejectedNotification' => [
            'model' => 'App\Models\CustomerDocument',
            'var' => 'document',
            'title' => '"Document Rejected"',
            'body' => '"Your document (" . ($this->document->documentType->name ?? "Document") . ") was rejected. Reason: " . $this->document->rejection_reason',
            'url' => 'config("app.url") . "/portal/documents/" . $this->document->id',
            'icon' => '"x-circle"',
            'severity' => '"error"',
        ],
        'DocumentVerifiedNotification' => [
            'model' => 'App\Models\CustomerDocument',
            'var' => 'document',
            'title' => '"Document Verified"',
            'body' => '"Your document (" . ($this->document->documentType->name ?? "Document") . ") has been verified."',
            'url' => 'config("app.url") . "/portal/documents/" . $this->document->id',
            'icon' => '"shield-check"',
            'severity' => '"success"',
        ],
        'TripReminderNotification' => [
            'model' => 'App\Models\Booking',
            'var' => 'booking',
            'title' => '"Upcoming Trip Reminder"',
            'body' => '"Your trip to " . ($this->booking->tourPackage->name ?? "Destination") . " is coming up on " . $this->booking->travel_date . "!"',
            'url' => 'config("app.url") . "/portal/bookings/" . $this->booking->id',
            'icon' => '"calendar"',
            'severity' => '"info"',
        ],
        'PaymentOverdueNotification' => [
            'model' => 'App\Models\PaymentSchedule',
            'var' => 'installment',
            'title' => '"Payment Overdue"',
            'body' => '"Your installment of " . number_format($this->installment->amount, 2) . " was due on " . $this->installment->due_date . "."',
            'url' => 'config("app.url") . "/portal/bookings/" . $this->installment->booking_id . "/payments"',
            'icon' => '"alert-triangle"',
            'severity' => '"warning"',
        ],
    ],
    'Staff' => [
        'NewInquiryNotification' => [
            'model' => 'App\Models\Customer',
            'var' => 'lead',
            'title' => '"New Inquiry Submitted"',
            'body' => '"A new inquiry was submitted by " . $this->lead->full_name . "."',
            'url' => 'config("app.url") . "/admin/inquiries/" . $this->lead->id',
            'icon' => '"inbox"',
            'severity' => '"info"',
        ],
        'DocumentUploadedNotification' => [
            'model' => 'App\Models\CustomerDocument',
            'var' => 'document',
            'title' => '"Document Uploaded"',
            'body' => '"Customer uploaded a new document (" . ($this->document->documentType->name ?? "Document") . ")."',
            'url' => 'config("app.url") . "/admin/documents/" . $this->document->id',
            'icon' => '"file-up"',
            'severity' => '"info"',
        ],
        'PaymentReceivedStaffNotification' => [
            'model' => 'App\Models\Payment',
            'var' => 'payment',
            'title' => '"Payment Received"',
            'body' => '"A payment of " . number_format($this->payment->amount, 2) . " " . $this->payment->currency . " was received."',
            'url' => 'config("app.url") . "/admin/payments/" . $this->payment->id',
            'icon' => '"dollar-sign"',
            'severity' => '"success"',
        ],
    ]
];

$dir = __DIR__ . '/../app/Notifications';
if (!is_dir($dir)) mkdir($dir, 0755, true);

foreach ($notifications as $group => $classes) {
    foreach ($classes as $class => $def) {
        $modelClass = $def['model'];
        $modelBaseName = class_basename($modelClass);
        $var = $def['var'];
        
        $code = "<?php\n\nnamespace App\Notifications;\n\n";
        $code .= "use Illuminate\Bus\Queueable;\n";
        $code .= "use Illuminate\Contracts\Queue\ShouldQueue;\n";
        $code .= "use Illuminate\Notifications\Messages\MailMessage;\n";
        $code .= "use Illuminate\Notifications\Notification;\n";
        $code .= "use {$modelClass};\n\n";
        $code .= "class {$class} extends Notification implements ShouldQueue\n{\n";
        $code .= "    use Queueable;\n\n";
        $code .= "    public \${$var};\n\n";
        $code .= "    public function __construct({$modelBaseName} \${$var})\n    {\n";
        $code .= "        \$this->{$var} = \${$var};\n    }\n\n";
        
        // via
        $code .= "    public function via(object \$notifiable): array\n    {\n";
        $code .= "        return \App\Services\NotificationGate::resolveChannels(\$notifiable, '{$class}');\n    }\n\n";
        
        // toMail
        $code .= "    public function toMail(object \$notifiable): MailMessage\n    {\n";
        $code .= "        return (new MailMessage)\n";
        $code .= "            ->subject(strip_tags({$def['title']}))\n";
        $code .= "            ->greeting('Hello!')\n";
        $code .= "            ->line({$def['body']})\n";
        $code .= "            ->action('View Details', {$def['url']});\n    }\n\n";
        
        // toArray
        $code .= "    public function toArray(object \$notifiable): array\n    {\n";
        $code .= "        return [\n";
        $code .= "            'type' => '{$class}',\n";
        $code .= "            'title' => {$def['title']},\n";
        $code .= "            'body' => {$def['body']},\n";
        $code .= "            'url' => {$def['url']},\n";
        $code .= "            'icon' => {$def['icon']},\n";
        $code .= "            'severity' => {$def['severity']},\n";
        $code .= "            'data' => [\n";
        $code .= "                'id' => \$this->{$var}->id,\n";
        $code .= "            ],\n";
        $code .= "        ];\n    }\n}\n";
        
        file_put_contents("{$dir}/{$class}.php", $code);
    }
}
echo "Notifications generated.\n";
