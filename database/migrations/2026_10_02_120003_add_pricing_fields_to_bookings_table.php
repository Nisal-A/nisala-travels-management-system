<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('extras_amount', 12, 2)->default(0)->after('discount_amount');
            $table->decimal('tax_amount', 12, 2)->default(0)->after('extras_amount');
            $table->json('extras')->nullable()->after('tax_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['extras_amount', 'tax_amount', 'extras']);
        });
    }
};
