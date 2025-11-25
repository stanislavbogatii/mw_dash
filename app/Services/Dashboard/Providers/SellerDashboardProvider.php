<?php

namespace App\Services\Dashboard\Providers;

use App\Models\User;
use App\Models\Deposit;
use App\Models\Spend;
use App\Models\Shift;
use App\Models\Kpi;
use App\Models\Project;
use App\Utils\CurrencyHelper;
class SellerDashboardProvider implements DashboardProviderInterface
{
    public function getView(): string
    {
        return 'dashboard/seller';
    }

    public function getData(User $user, string $date): array
    {
        $projectIds = Shift::where('user_id',$user->id)
            ->where('date',$date)
            ->pluck('project_id');

        $deposits = Deposit::with(['user','project'])
        ->where('date',$date)
        ->where('user_id',$user->id)
        ->get();

        return [
            'deposits' => CurrencyHelper::setCurrencyToDeposits($deposits),

            'spends' => [],

            'shifts' => Shift::with(['project'])
                ->where('date',$date)
                ->where('user_id',$user->id)
                ->get(),

            'projects' => Project::whereIn('id',$projectIds)->get(),

            'kpi' => Kpi::where('date',$date)
                ->whereIn('project_id',$projectIds)
                ->get(),
        ];
    }
}
