<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('destination_id')->constrained()->restrictOnDelete();
            $table->string('package_name');
            $table->text('description')->nullable();
            $table->integer('duration_days')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('price', 12, 2);
            $table->string('currency', 3)->default('LKR');
            $table->integer('capacity')->nullable();
            $table->integer('available_seats')->nullable();
            $table->text('hotel_information')->nullable();
            $table->text('transportation_information')->nullable();
            $table->text('meals')->nullable();
            $table->text('included_items')->nullable();
            $table->text('excluded_items')->nullable();
            $table->text('terms')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_packages');
    }
};
