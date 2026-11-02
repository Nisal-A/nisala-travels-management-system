<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_cost_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tour_package_id')->constrained('tour_packages')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->string('category', 50); // hotel, transport, guide, air_ticket, food, other
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 10)->default('LKR');
            $table->decimal('exchange_rate_to_lkr', 18, 6)->default(1);
            $table->decimal('amount_lkr', 12, 2);
            $table->date('incurred_on');
            $table->date('paid_on')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_cost_lines');
    }
};
