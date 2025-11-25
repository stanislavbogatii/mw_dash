<?php

namespace App\Services\Dashboard\Providers;

use App\Models\User;

class DefaultDashboardProvider implements DashboardProviderInterface
{
    public function getView(): string
    {
        return 'dashboard/default';
    }

    public function getData(User $user, string $date): array
    {
        return [
            'message' => 'No dashboard permissions assigned',
        ];
    }
}
