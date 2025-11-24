<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('kpi', function (Blueprint $table) {
            $table->decimal('fd_income')->nullable()->change();
            $table->decimal('rd_income')->nullable()->change();
            $table->decimal('total_income')->nullable()->change();
            $table->decimal('total_spend')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('kpi', function (Blueprint $table) {
            $table->string('fd_income')->nullable()->change();
            $table->string('rd_income')->nullable()->change();
            $table->string('total_income')->nullable()->change();
            $table->string('total_spend')->nullable()->change();
        });
    }

};
