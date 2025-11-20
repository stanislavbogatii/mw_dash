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
        Schema::create('salary_schemes', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->decimal('value');
            $table->decimal('min')->nullable();
            $table->decimal('max')->nullable();
            $table->string('type');
            $table->enum('value_type', ['percent', 'amount']);
            $table->enum('position_type', ['FD', 'RD', 'ALL', "BUYING", "PERSONAL"]);
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_schemes');
    }
};
