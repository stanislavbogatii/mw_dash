<?php

namespace App\Services\Dashboard\Providers;

use App\Models\User;
use App\Models\Deposit;
use App\Models\Spend;
use App\Models\Project;
use App\Models\Kpi;
use App\Models\Currency;
use Illuminate\Support\Collection;
use App\Utils\CurrencyHelper;

class AdvertiserDashboardProvider implements DashboardProviderInterface
{
    public function getView(): string
    {
        return 'dashboard/advertiser';
    }

    public function getData(User $user, string $date): array
    {
        $deposits = Deposit::with(['user','project'])->where('date',$date)->get();
        return [
            'deposits' => CurrencyHelper::setCurrencyToDeposits($deposits),
            'spends'   => Spend::with(['user','project'])->where('date',$date)->get(),
            'projects' => Project::select('id','name')->get(),
            'kpi'      => Kpi::where('date',$date)->get(),
        ];
    }
}
