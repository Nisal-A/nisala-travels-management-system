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
        Schema::table('payments', function (Blueprint $table) {
            $table->index(['payment_date', 'status'], 'payments_payment_date_status_index');
        });

        Schema::table('payment_schedules', function (Blueprint $table) {
            $table->index('due_date', 'payment_schedules_due_date_index');
        });

        Schema::table('customer_documents', function (Blueprint $table) {
            $table->index(['expiry_date', 'verification_status'], 'customer_documents_expiry_date_verification_status_index');
        });

        Schema::table('tour_packages', function (Blueprint $table) {
            $table->index('start_date', 'tour_packages_start_date_index');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->index(['status', 'paid_on'], 'refunds_status_paid_on_index');
        });

        Schema::table('package_cost_lines', function (Blueprint $table) {
            $table->index('incurred_on', 'package_cost_lines_incurred_on_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_payment_date_status_index');
        });

        Schema::table('payment_schedules', function (Blueprint $table) {
            $table->dropIndex('payment_schedules_due_date_index');
        });

        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropIndex('customer_documents_expiry_date_verification_status_index');
        });

        Schema::table('tour_packages', function (Blueprint $table) {
            $table->dropIndex('tour_packages_start_date_index');
        });

        Schema::table('refunds', function (Blueprint $table) {
            $table->dropIndex('refunds_status_paid_on_index');
        });

        Schema::table('package_cost_lines', function (Blueprint $table) {
            $table->dropIndex('package_cost_lines_incurred_on_index');
        });
    }
};

