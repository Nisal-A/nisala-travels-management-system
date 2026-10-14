<?php

namespace App\Events;

use App\Models\Inquiry;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InquirySubmitted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lead;

    public function __construct(Inquiry $lead)
    {
        $this->lead = $lead;
    }
}
