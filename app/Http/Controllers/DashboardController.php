<?php

namespace App\Http\Controllers;
use Laravel\Fortify\Features;
use App\Models\User;
use App\Models\Deposit;
use App\Models\Spend;
use App\Models\Shift;
use App\Models\Project;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = now()->format('Y-m-d');

        $deposits = Deposit::with([
            'user:id,name,username',
            'project:id,name',
        ])
        ->where('date', $today)
        ->get();

        $spends = Spend::with([
            'user:id,name,username',
            'project:id,name',
        ])
        ->where('date', $today)
        ->get();

        $shifts = Shift::with([
            'user:id,name,username',
            'project:id,name',
        ])
        ->where('date', $today)
        ->get();

        $projects = Project::select('id', 'name')->get();

        return Inertia::render('dashboard', [
            'canRegister' => Features::enabled(Features::registration()),
            'deposits' => $deposits,
            'spends' => $spends,
            'projects' => $projects,
            'shifts' => $shifts
        ]);
    }
}
