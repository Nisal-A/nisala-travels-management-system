<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Customer;

class InquirySubmitted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $lead;

    public function __construct(Customer $lead)
    {
        $this->lead = $lead;
    }
}
