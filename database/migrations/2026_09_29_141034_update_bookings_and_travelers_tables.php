<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\BookingStatus;
use App\Enums\TravelerType;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // Drop old string-based statuses and recreate them safely or just alter if db supports.
            // SQLite doesn't fully support dropping/modifying easily, but we're on MySQL.
            // Alternatively, we just leave the strings and enforce them at the model level (Enum cast).
            // But let's add the missing financial and tracking fields.
            
            $table->decimal('base_amount', 12, 2)->default(0)->after('number_of_travelers');
            $table->decimal('discount_amount', 12, 2)->default(0)->after('base_amount');
            $table->decimal('final_amount', 12, 2)->default(0)->after('discount_amount');
            $table->decimal('paid_amount', 12, 2)->default(0)->after('final_amount');
            $table->decimal('balance_amount', 12, 2)->default(0)->after('paid_amount');
            $table->string('currency', 3)->default('LKR')->after('balance_amount');
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete()->after('notes');
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete()->after('created_by');
        });

        Schema::table('booking_travelers', function (Blueprint $table) {
            $table->string('nationality')->nullable()->after('gender');
            $table->date('passport_expiry')->nullable()->after('passport_number');
            $table->string('traveler_type')->default('adult')->after('relationship_to_primary');
            $table->text('notes')->nullable()->after('special_requirements');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn([
                'base_amount',
                'discount_amount',
                'final_amount',
                'paid_amount',
                'balance_amount',
                'currency',
                'created_by',
                'updated_by',
            ]);
        });

        Schema::table('booking_travelers', function (Blueprint $table) {
            $table->dropColumn([
                'nationality',
                'passport_expiry',
                'traveler_type',
                'notes',
            ]);
        });
    }
};
