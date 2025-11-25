<?php

namespace App\Services\Dashboard\Providers;

use App\Models\User;

interface DashboardProviderInterface
{
    public function getView(): string;
    public function getData(User $user, string $date): array;
}
