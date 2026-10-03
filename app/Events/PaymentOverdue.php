<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\PaymentSchedule;

class PaymentOverdue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $installment;

    public function __construct(PaymentSchedule $installment)
    {
        $this->installment = $installment;
    }
}
