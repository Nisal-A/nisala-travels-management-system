<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Deactivates Sri Lanka destination and tour packages safely without hard-deleting records.
     */
    public function up(): void
    {
        // 1. Mark Sri Lanka tour packages as inactive
        DB::table('tour_packages')
            ->whereIn('slug', [
                'cultural-triangle-discovery',
                'southern-coast-and-wildlife',
                'hill-country-and-tea-trails',
            ])
            ->orWhereIn('destination_id', function ($query) {
                $query->select('id')
                    ->from('destinations')
                    ->where('slug', 'sri-lanka')
                    ->orWhere('country', 'Sri Lanka');
            })
            ->update([
                'status' => 'inactive',
                'is_active' => false,
                'updated_at' => now(),
            ]);

        // 2. Mark Sri Lanka destination as inactive and hidden
        DB::table('destinations')
            ->where('slug', 'sri-lanka')
            ->orWhere('country', 'Sri Lanka')
            ->update([
                'status' => 'inactive',
                'listing_state' => 'hidden',
                'updated_at' => now(),
            ]);
    }

    /**
     * Reverse the migrations.
     * Restores previous status/listing_state without deleting any data.
     */
    public function down(): void
    {
        DB::table('destinations')
            ->where('slug', 'sri-lanka')
            ->orWhere('country', 'Sri Lanka')
            ->update([
                'status' => 'active',
                'listing_state' => 'coming_soon',
                'updated_at' => now(),
            ]);

        DB::table('tour_packages')
            ->whereIn('slug', [
                'cultural-triangle-discovery',
                'southern-coast-and-wildlife',
                'hill-country-and-tea-trails',
            ])
            ->orWhereIn('destination_id', function ($query) {
                $query->select('id')
                    ->from('destinations')
                    ->where('slug', 'sri-lanka')
                    ->orWhere('country', 'Sri Lanka');
            })
            ->update([
                'status' => 'draft',
                'is_active' => false,
                'updated_at' => now(),
            ]);
    }
};
