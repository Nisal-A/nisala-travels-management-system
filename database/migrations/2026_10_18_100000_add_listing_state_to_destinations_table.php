<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->string('listing_state')->default('live')->after('status');
        });

        // Backfill slug 'sri-lanka' to 'coming_soon'
        DB::table('destinations')->where('slug', 'sri-lanka')->update(['listing_state' => 'coming_soon']);
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn('listing_state');
        });
    }
};
