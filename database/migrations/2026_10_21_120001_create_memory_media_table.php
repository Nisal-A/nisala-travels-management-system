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
        Schema::create('memory_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('memory_year_id')->constrained('memory_years')->cascadeOnDelete();
            $table->string('type'); // 'image' or 'video'
            $table->string('file_path')->nullable(); // public disk under memories/
            $table->text('external_url')->nullable(); // for video only
            $table->string('poster_path')->nullable();
            $table->string('alt_text')->nullable(); // required for images
            $table->text('caption')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('memory_media');
    }
};
