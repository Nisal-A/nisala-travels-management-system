<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->unsignedInteger('duration_nights')->nullable()->after('duration_days');
            $table->unsignedInteger('group_min')->nullable()->after('available_seats');
            $table->json('itinerary')->nullable()->after('terms');
            $table->json('highlights')->nullable()->after('itinerary');
            $table->json('tags')->nullable()->after('highlights');
            $table->json('departure_months')->nullable()->after('tags');
            $table->json('faqs')->nullable()->after('departure_months');
            $table->unsignedInteger('sort_order')->default(0)->after('faqs');
        });

        // Backfill null slugs and duration_nights
        $packages = DB::table('tour_packages')->orderBy('id')->get();
        $usedSlugs = DB::table('tour_packages')->whereNotNull('slug')->pluck('slug')->all();

        foreach ($packages as $pkg) {
            $updates = [];

            if (empty($pkg->slug)) {
                $baseSlug = Str::slug($pkg->package_name) ?: 'tour';
                $slug = $baseSlug;
                $counter = 2;

                while (in_array($slug, $usedSlugs, true) || DB::table('tour_packages')->where('slug', $slug)->where('id', '!=', $pkg->id)->exists()) {
                    $slug = "{$baseSlug}-{$counter}";
                    $counter++;
                }

                $usedSlugs[] = $slug;
                $updates['slug'] = $slug;
            }

            if (is_null($pkg->duration_nights) && !is_null($pkg->duration_days)) {
                $updates['duration_nights'] = max((int) $pkg->duration_days - 1, 0);
            }

            if (!empty($updates)) {
                DB::table('tour_packages')->where('id', $pkg->id)->update($updates);
            }
        }
    }

    public function down(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropColumn([
                'duration_nights',
                'group_min',
                'itinerary',
                'highlights',
                'tags',
                'departure_months',
                'faqs',
                'sort_order',
            ]);
        });
    }
};
