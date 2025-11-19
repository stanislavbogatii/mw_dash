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
        Schema::create('kpi', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->decimal('total_spend');
            $table->integer('total_pdp')->nullable();
            $table->integer('total_dialogs')->nullable();
            $table->decimal('total_income')->nullable();
            $table->integer('total_deposits')->nullable();
            $table->decimal('fd_income')->nullable();
            $table->decimal('rd_income')->nullable();
            $table->integer('fd_deposits')->nullable();
            $table->integer('rd_deposits')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kpi');
    }
};
