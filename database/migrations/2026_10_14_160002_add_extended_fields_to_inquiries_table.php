<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->string('reference', 12)->nullable()->unique()->after('id');
            $table->string('interest')->nullable()->after('reference');
            $table->foreignId('tour_package_id')->nullable()->after('interest')->constrained('tour_packages')->nullOnDelete();
            $table->foreignId('destination_id')->nullable()->after('tour_package_id')->constrained('destinations')->nullOnDelete();
            $table->string('email')->nullable()->after('contact_information');
            $table->string('phone')->nullable()->after('email');
            $table->string('preferred_contact')->nullable()->after('phone');
            $table->string('country')->nullable()->after('destination');
            $table->date('start_date')->nullable()->after('travel_date');
            $table->date('end_date')->nullable()->after('start_date');
            $table->boolean('flexible_dates')->default(false)->after('end_date');
            $table->unsignedTinyInteger('adults')->nullable()->after('number_of_travelers');
            $table->unsignedTinyInteger('children')->default(0)->after('adults');
            $table->json('child_ages')->nullable()->after('children');
            $table->string('budget_range')->nullable()->after('child_ages');
            $table->string('referral_source')->nullable()->after('source');
            $table->timestamp('privacy_consent_at')->nullable()->after('follow_up_information');
            $table->timestamp('marketing_consent_at')->nullable()->after('privacy_consent_at');
            $table->string('ip_hash', 64)->nullable()->after('marketing_consent_at');
            $table->string('user_agent', 255)->nullable()->after('ip_hash');
            $table->timestamp('submitted_at')->nullable()->after('user_agent');
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            if (DB::getDriverName() !== 'sqlite') {
                $table->dropForeign(['tour_package_id']);
                $table->dropForeign(['destination_id']);
                $table->dropUnique(['reference']);
            }
            $table->dropColumn([
                'reference',
                'interest',
                'tour_package_id',
                'destination_id',
                'email',
                'phone',
                'preferred_contact',
                'country',
                'start_date',
                'end_date',
                'flexible_dates',
                'adults',
                'children',
                'child_ages',
                'budget_range',
                'referral_source',
                'privacy_consent_at',
                'marketing_consent_at',
                'ip_hash',
                'user_agent',
                'submitted_at',
            ]);
        });
    }
};
