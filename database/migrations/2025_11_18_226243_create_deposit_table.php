<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\DepositType;
use App\Enums\DepositStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deposits', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('time');
            $table->decimal('amount');
            $table->enum('status', [
                DepositStatus::PAID->value,
                DepositStatus::PENDING->value,
                DepositStatus::FAILED->value,
            ])->default(DepositStatus::PENDING->value);
            $table->enum('type', [
                DepositType::FD->value,
                DepositType::RD->value,
            ])->default(DepositType::FD->value);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('commission_id')->nullable()->constrained('commissions')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposits');
    }
};
