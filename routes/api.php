<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\FineController;
use App\Http\Controllers\KpiController;
use App\Http\Controllers\SpendController;
use App\Http\Controllers\BonusController;
use App\Http\Controllers\SalarySchemeController;


Route::middleware(['auth'])->group(function () {
    Route::post('/deposits', [DepositController::class, 'storeApi']);
    Route::patch('/deposits/{deposit}', [DepositController::class, 'updateApi']);
    Route::post('/shifts', [ShiftController::class, 'storeApi']);
    Route::patch('/shifts/{shift}', [ShiftController::class, 'updateApi']);
    Route::post('/commissions/reorder', [CommissionController::class, 'reorderApi']);
    Route::post('/currencies', [CurrencyController::class, 'storeApi']);
    Route::patch('/currencies/{currency}', [CurrencyController::class, 'updateApi']);
    Route::post('/fines', [FineController::class, 'storeApi']);
    Route::patch('/fines/{fine}', [FineController::class, 'updateApi']);
    Route::post('/kpi', [KpiController::class, 'storeApi']);
    Route::patch('/kpi/{kpi}', [KpiController::class, 'updateApi']);
    Route::post('/spend', [SpendController::class, 'storeApi']);
    Route::patch('/spend/{spend}', [SpendController::class, 'updateApi']);
    Route::post('/bonus', [BonusController::class, 'storeApi']);
    Route::patch('/bonus/{spend}', [BonusController::class, 'updateApi']);
    Route::post('/salary-scheme', [SalarySchemeController::class, 'storeApi']);
    Route::patch('/salary-scheme/{salaryScheme}', [SalarySchemeController::class, 'updateApi']);
    Route::post('/my-sales', [\App\Http\Controllers\MySalesController::class, 'storeApi']);
});
