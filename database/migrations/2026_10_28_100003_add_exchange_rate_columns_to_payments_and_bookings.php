<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add exchange rate columns to payments
        Schema::table('payments', function (Blueprint $table) {
            $table->decimal('exchange_rate_to_lkr', 18, 6)->default(1)->after('currency');
            $table->decimal('amount_lkr', 12, 2)->nullable()->after('exchange_rate_to_lkr');
        });

        // Add exchange rate column to bookings
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('exchange_rate_to_lkr', 18, 6)->default(1)->after('currency');
        });

        // Backfill existing records
        $this->backfillPayments();
        $this->backfillBookings();
    }

    private function backfillPayments(): void
    {
        // LKR payments: rate is 1, amount_lkr = amount
        DB::table('payments')
            ->where('currency', 'LKR')
            ->update([
                'exchange_rate_to_lkr' => 1,
                'amount_lkr' => DB::raw('amount'),
            ]);

        // Non-LKR payments: try to find the latest available rate
        $nonLkrPayments = DB::table('payments')
            ->where('currency', '!=', 'LKR')
            ->get();

        foreach ($nonLkrPayments as $payment) {
            $latestRate = DB::table('exchange_rates')
                ->where('currency', $payment->currency)
                ->orderByDesc('fetched_at')
                ->first();

            if ($latestRate) {
                $rate = $latestRate->rate_to_lkr;
                $amountLkr = bcmul((string) $payment->amount, (string) $rate, 2);

                DB::table('payments')
                    ->where('id', $payment->id)
                    ->update([
                        'exchange_rate_to_lkr' => $rate,
                        'amount_lkr' => $amountLkr,
                    ]);
            } else {
                // No rate available — use 1 and flag in log
                DB::table('payments')
                    ->where('id', $payment->id)
                    ->update([
                        'exchange_rate_to_lkr' => 1,
                        'amount_lkr' => $payment->amount,
                    ]);

                Log::warning("Backfill: payment #{$payment->id} ({$payment->currency}) has no exchange rate; defaulted to 1.");
            }
        }
    }

    private function backfillBookings(): void
    {
        // LKR bookings: rate is 1
        DB::table('bookings')
            ->where('currency', 'LKR')
            ->update(['exchange_rate_to_lkr' => 1]);

        // Non-LKR bookings
        $nonLkrBookings = DB::table('bookings')
            ->where('currency', '!=', 'LKR')
            ->get();

        foreach ($nonLkrBookings as $booking) {
            $latestRate = DB::table('exchange_rates')
                ->where('currency', $booking->currency)
                ->orderByDesc('fetched_at')
                ->first();

            if ($latestRate) {
                DB::table('bookings')
                    ->where('id', $booking->id)
                    ->update(['exchange_rate_to_lkr' => $latestRate->rate_to_lkr]);
            } else {
                DB::table('bookings')
                    ->where('id', $booking->id)
                    ->update(['exchange_rate_to_lkr' => 1]);

                Log::warning("Backfill: booking #{$booking->id} ({$booking->currency}) has no exchange rate; defaulted to 1.");
            }
        }
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['exchange_rate_to_lkr', 'amount_lkr']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('exchange_rate_to_lkr');
        });
    }
};
