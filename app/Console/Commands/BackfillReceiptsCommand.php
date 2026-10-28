<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\PaymentReceipt;
use App\Services\NumberGenerator;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillReceiptsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'receipts:backfill';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Backfill missing receipt rows for existing completed payments ordered by payment_date then id.';

    /**
     * Execute the console command.
     */
    public function handle(NumberGenerator $generator): int
    {
        $this->info('Starting receipts backfill...');

        $payments = Payment::query()
            ->whereIn('status', [PaymentStatus::Completed, 'completed', 'Completed'])
            ->whereDoesntHave('receipt')
            ->orderBy('payment_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $count = $payments->count();

        if ($count === 0) {
            $this->info('No completed payments found needing receipts.');
            return self::SUCCESS;
        }

        $this->info("Found {$count} completed payment(s) without receipts. Processing...");

        $created = 0;

        foreach ($payments as $payment) {
            DB::transaction(function () use ($payment, $generator, &$created) {
                $year = $payment->payment_date
                    ? (int) Carbon::parse($payment->payment_date)->format('Y')
                    : (int) now()->format('Y');

                $receiptNumber = $generator->receipt($year);

                PaymentReceipt::create([
                    'payment_id' => $payment->id,
                    'receipt_number' => $receiptNumber,
                    'generated_by' => $payment->recorded_by,
                ]);

                $created++;
            });
        }

        $this->info("Successfully generated {$created} receipt(s).");

        return self::SUCCESS;
    }
}
