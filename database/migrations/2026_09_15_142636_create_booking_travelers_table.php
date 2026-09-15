<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_travelers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('full_name');
            $table->date('dob')->nullable();
            $table->string('gender')->nullable();
            $table->string('nic')->nullable();
            $table->string('passport_number')->nullable();
            $table->string('relationship_to_primary')->nullable();
            $table->string('contact_information')->nullable();
            $table->text('special_requirements')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_travelers');
    }
};
