<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Permanently deletes Sri Lanka destination and all associated packages and booking records.
     * Marks Maldives destination as coming_soon.
     */
    public function up(): void
    {
        // 1. Identify Sri Lanka destination IDs
        $destinationIds = DB::table('destinations')
            ->where('country', 'Sri Lanka')
            ->orWhere('slug', 'sri-lanka')
            ->pluck('id')
            ->toArray();

        if (!empty($destinationIds)) {
            // 2. Identify associated tour package IDs
            $packageIds = DB::table('tour_packages')
                ->whereIn('destination_id', $destinationIds)
                ->pluck('id')
                ->toArray();

            if (!empty($packageIds)) {
                // 3. Identify associated booking IDs
                $bookingIds = DB::table('bookings')
                    ->whereIn('tour_package_id', $packageIds)
                    ->pluck('id')
                    ->toArray();

                if (!empty($bookingIds)) {
                    // Identify payment IDs for these bookings
                    $paymentIds = DB::table('payments')
                        ->whereIn('booking_id', $bookingIds)
                        ->pluck('id')
                        ->toArray();

                    if (!empty($paymentIds)) {
                        DB::table('payment_receipts')->whereIn('payment_id', $paymentIds)->delete();
                        DB::table('payments')->whereIn('id', $paymentIds)->delete();
                    }

                    // Delete booking child records
                    DB::table('payment_schedules')->whereIn('booking_id', $bookingIds)->delete();
                    DB::table('booking_notes')->whereIn('booking_id', $bookingIds)->delete();
                    DB::table('booking_reminders')->whereIn('booking_id', $bookingIds)->delete();
                    DB::table('booking_travelers')->whereIn('booking_id', $bookingIds)->delete();

                    // Disassociate or delete customer documents referencing these bookings
                    DB::table('customer_documents')->whereIn('booking_id', $bookingIds)->update(['booking_id' => null]);

                    // Delete bookings
                    DB::table('bookings')->whereIn('id', $bookingIds)->delete();
                }

                // Delete package child records
                DB::table('package_media')->whereIn('tour_package_id', $packageIds)->delete();

                // Clear inquiries referencing these packages
                DB::table('inquiries')->whereIn('tour_package_id', $packageIds)->update(['tour_package_id' => null]);

                // Delete tour packages
                DB::table('tour_packages')->whereIn('id', $packageIds)->delete();
            }

            // Clear inquiries or memory years referencing Sri Lanka destination
            DB::table('inquiries')->whereIn('destination_id', $destinationIds)->update(['destination_id' => null]);
            DB::table('memory_years')->whereIn('destination_id', $destinationIds)->update(['destination_id' => null]);

            // Delete Sri Lanka destination(s)
            DB::table('destinations')->whereIn('id', $destinationIds)->delete();
        }

        // Update Maldives destination to coming_soon status and listing_state
        DB::table('destinations')
            ->where('slug', 'maldives')
            ->update([
                'status' => 'coming_soon',
                'listing_state' => 'coming_soon',
            ]);
    }

    /**
     * Reverse the migrations.
     * Permanent deletion - no rollback.
     */
    public function down(): void
    {
        // Permanent deletion; down is intentionally empty.
    }
};
