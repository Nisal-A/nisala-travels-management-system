<?php

namespace App\Events;

use App\Models\PaymentSchedule;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaymentOverdue
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $installment;

    public function __construct(PaymentSchedule $installment)
    {
        $this->installment = $installment;
    }
}
