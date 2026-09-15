<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('contact_information');
            $table->string('destination')->nullable();
            $table->string('package_interest')->nullable();
            $table->date('travel_date')->nullable();
            $table->integer('number_of_travelers')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('New')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('source')->nullable();
            $table->text('follow_up_information')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
