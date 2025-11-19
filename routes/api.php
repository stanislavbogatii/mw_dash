<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\FineController;
use App\Http\Controllers\KpiController;
use App\Http\Controllers\SpendController;

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