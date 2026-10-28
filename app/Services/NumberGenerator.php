<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class NumberGenerator
{
    /**
     * Get the next sequence number for a key and optional year.
     * Uses a database transaction and row locking for concurrency safety.
     */
    public function next(string $key, ?int $year = null): int
    {
        return DB::transaction(function () use ($key, $year) {
            $query = DB::table('number_sequences')->where('key', $key);

            if ($year === null) {
                $query->whereNull('year');
            } else {
                $query->where('year', $year);
            }

            $sequence = $query->lockForUpdate()->first();

            if (! $sequence) {
                try {
                    DB::table('number_sequences')->insert([
                        'key' => $key,
                        'year' => $year,
                        'last_value' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Throwable $e) {
                    // Row might have been inserted concurrently
                }

                $query = DB::table('number_sequences')->where('key', $key);
                if ($year === null) {
                    $query->whereNull('year');
                } else {
                    $query->where('year', $year);
                }
                $sequence = $query->lockForUpdate()->first();
            }

            $nextVal = (int) $sequence->last_value + 1;

            DB::table('number_sequences')
                ->where('id', $sequence->id)
                ->update([
                    'last_value' => $nextVal,
                    'updated_at' => now(),
                ]);

            return $nextVal;
        });
    }

    /**
     * Generate the next receipt number formatted as RCP-{YYYY}-{6 digits}.
     */
    public function receipt(?int $year = null): string
    {
        $year = $year ?? (int) now()->format('Y');
        $seq = $this->next('receipt', $year);

        return $this->formatReceipt($seq, $year);
    }

    /**
     * Generate the next refund number formatted as RFD-{YYYY}-{5 digits}.
     */
    public function refund(?int $year = null): string
    {
        $year = $year ?? (int) now()->format('Y');
        $seq = $this->next('refund', $year);

        return $this->formatRefund($seq, $year);
    }

    /**
     * Generate the next supplier code formatted as SUP-{4 digits}.
     */
    public function supplier(): string
    {
        $seq = $this->next('supplier', null);

        return $this->formatSupplier($seq);
    }

    /**
     * Format a receipt sequence number.
     */
    public function formatReceipt(int $seq, ?int $year = null): string
    {
        $year = $year ?? (int) now()->format('Y');

        return sprintf('RCP-%04d-%06d', $year, $seq);
    }

    /**
     * Format a refund sequence number.
     */
    public function formatRefund(int $seq, ?int $year = null): string
    {
        $year = $year ?? (int) now()->format('Y');

        return sprintf('RFD-%04d-%05d', $year, $seq);
    }

    /**
     * Format a supplier sequence number.
     */
    public function formatSupplier(int $seq): string
    {
        return sprintf('SUP-%04d', $seq);
    }

    /**
     * Static helper for next.
     */
    public static function nextNumber(string $key, ?int $year = null): int
    {
        return (new self())->next($key, $year);
    }

    /**
     * Static helper for receipt.
     */
    public static function forReceipt(?int $year = null): string
    {
        return (new self())->receipt($year);
    }

    /**
     * Static helper for refund.
     */
    public static function forRefund(?int $year = null): string
    {
        return (new self())->refund($year);
    }

    /**
     * Static helper for supplier.
     */
    public static function forSupplier(): string
    {
        return (new self())->supplier();
    }
}
