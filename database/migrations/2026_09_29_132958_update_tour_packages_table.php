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
            $table->string('package_id')->unique()->after('id')->nullable();
            $table->foreignId('tour_category_id')->nullable()->after('destination_id')->constrained()->restrictOnDelete();
            $table->integer('duration_nights')->nullable()->after('duration_days');
            $table->string('cover_image_path')->nullable()->after('status');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropForeign(['tour_category_id']);
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn([
                'package_id',
                'tour_category_id',
                'duration_nights',
                'cover_image_path',
                'created_by',
                'updated_by'
            ]);
        });
    }
};
