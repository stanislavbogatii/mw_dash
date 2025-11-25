<?php

namespace App\Services\Dashboard;

use App\Models\User;
use App\Services\Dashboard\Providers\{
    OwnerDashboardProvider,
    AdvertiserDashboardProvider,
    SellerDashboardProvider,
    DefaultDashboardProvider,
    DashboardProviderInterface
};

class DashboardResolver
{
    public static function resolve(User $user): DashboardProviderInterface
    {
        $roles = $user->roles->pluck('name')->toArray();

        if (in_array('owner', $roles)) {
            return new OwnerDashboardProvider();
        }

        if (in_array('buyier', $roles)) {
            return new AdvertiserDashboardProvider();
        }

        if (in_array('sales_manager', $roles)) {
            return new SellerDashboardProvider();
        }

        return new DefaultDashboardProvider();
    }
}
