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

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
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

Route::middleware(['auth'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::resource('users', UsersController::class)
            ->only(['index', 'edit', 'update', 'create', 'store']);

        Route::resource('roles', RolesController::class)
            ->only(['index', 'store']);
    });


require __DIR__.'/settings.php';
