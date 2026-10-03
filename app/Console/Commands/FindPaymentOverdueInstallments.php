<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PaymentSchedule;
use App\Events\PaymentOverdue;
use Carbon\Carbon;

class FindPaymentOverdueInstallments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'payments:find-overdue';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find overdue unpaid installments and dispatch PaymentOverdue events';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $overdueInstallments = PaymentSchedule::where('status', 'unpaid')
            ->whereDate('due_date', '<', Carbon::today())
            ->get();

        $count = 0;
        foreach ($overdueInstallments as $installment) {
            event(new PaymentOverdue($installment));
            $count++;
        }

        $this->info("Dispatched PaymentOverdue for {$count} installments.");
    }
}
