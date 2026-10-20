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
        Schema::table('destinations', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('id');
            $table->string('region')->nullable()->after('city_region');
            $table->string('tagline')->nullable()->after('region');
            $table->string('best_months')->nullable()->after('tagline');
            $table->json('facts')->nullable()->after('best_months');
            $table->json('highlights')->nullable()->after('facts');
            $table->string('hero_image')->nullable()->after('highlights');
            $table->json('gallery')->nullable()->after('hero_image');
            $table->unsignedInteger('sort_order')->default(0)->after('gallery');
        });

        // Backfill slug with Str::slug(city_region), handling collisions
        $destinations = DB::table('destinations')->orderBy('id')->get();
        $usedSlugs = [];

        foreach ($destinations as $dest) {
            $baseSlug = Str::slug($dest->city_region) ?: 'destination';
            $slug = $baseSlug;
            $counter = 2;

            while (in_array($slug, $usedSlugs, true) || DB::table('destinations')->where('slug', $slug)->where('id', '!=', $dest->id)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }

            $usedSlugs[] = $slug;
            DB::table('destinations')->where('id', $dest->id)->update(['slug' => $slug]);
        }

        // Add unique constraint after backfill
        Schema::table('destinations', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropUnique(['slug']);
            }
            $table->dropColumn([
                'slug',
                'region',
                'tagline',
                'best_months',
                'facts',
                'highlights',
                'hero_image',
                'gallery',
                'sort_order',
            ]);
        });
    }
};
