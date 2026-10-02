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
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->string('slug')->unique()->nullable();
            $table->text('short_description')->nullable();
            $table->string('hero_image')->nullable();
            $table->json('gallery')->nullable();
            $table->decimal('price_from', 12, 2)->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropColumn([
                'slug',
                'short_description',
                'hero_image',
                'gallery',
                'price_from',
                'is_featured',
                'is_active',
            ]);
        });
    }
};
