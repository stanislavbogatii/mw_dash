<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Admin\RolesController;
use App\Http\Controllers\BonusController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DepositController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\FineController;
use App\Http\Controllers\KpiController;
use App\Http\Controllers\SpendController;
use App\Http\Controllers\SalarySchemeController;
use App\Http\Controllers\MySalesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MySpendsController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

Route::resource('projects', ProjectController::class);
Route::resource('currencies', CurrencyController::class);
Route::resource('deposits', DepositController::class);
Route::resource('shifts', ShiftController::class);
Route::resource('commissions', CommissionController::class);
Route::resource('fines', FineController::class);
Route::resource('kpi', KpiController::class);
Route::resource('spend', SpendController::class);
Route::resource('bonus', BonusController::class);
Route::resource('salary-scheme', SalarySchemeController::class);
Route::resource('my-sales', MySalesController::class);
Route::resource('my-spends', MySpendsController::class);

Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::resource('users', UsersController::class)
            ->only(['index', 'edit', 'update', 'create', 'store']);

        Route::resource('roles', RolesController::class)
            ->only(['index', 'store']);
    });



// api
Route::middleware(['auth'])->prefix('api')->group(function () {
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
    Route::post('/my-sales', [MySalesController::class, 'storeApi']);
    Route::post('/my-sales/{mySales}', [MySalesController::class, 'updateApi']);
    Route::post('/my-spends', [MySpendsController::class, 'storeApi']);
    Route::patch('/my-spends/{mySpend}', [MySpendsController::class, 'updateApi']);
});



require __DIR__.'/settings.php';
