<?php

namespace App\Http\Controllers;
use Laravel\Fortify\Features;
use App\Models\Deposit;
use App\Models\Spend;
use App\Models\Shift;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Kpi;
use App\Models\User;
use App\Services\DashboardDataService;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $data = DashboardDataService::for($request->user())
            ->date($date)
            ->get();

        return Inertia::render('dashboard', $data);
    }
}
