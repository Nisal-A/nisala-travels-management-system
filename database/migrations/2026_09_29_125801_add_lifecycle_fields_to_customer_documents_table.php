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
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->foreignId('replaced_by_id')->nullable()->after('notes')->constrained('customer_documents')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_documents', function (Blueprint $table) {
            $table->dropForeign(['replaced_by_id']);
            $table->dropColumn(['replaced_by_id']);
        });
    }
};
