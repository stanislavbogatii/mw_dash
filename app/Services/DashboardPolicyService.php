<?php

namespace App\Services;

use App\Models\User;

class DashboardPolicyService
{
    public static function getPermissions(User $user): array
    {
        // Собираем массив всех названий ролей юзера
        $roles = $user->roles->pluck('name')->toArray();

        // Приоритет ролей
        if (in_array('owner', $roles)) {
            return self::ownerPermissions();
        }

        if (in_array('buyier', $roles)) {
            return self::advertiserPermissions();
        }

        if (in_array('sales_manager', $roles)) {
            return self::sellerPermissions();
        }

        return self::defaultPermissions();
    }

    // OWNER / ADMIN
    private static function ownerPermissions(): array
    {
        return [
            'role_level' => 'owner',
            'view_total' => true,
            'view_projects' => true,
            'view_personal' => true,
        ];
    }

    // ADVERTISER
    private static function advertiserPermissions(): array
    {
        return [
            'role_level' => 'advertiser',
            'view_total' => true,
            'view_projects' => true,
            'view_personal' => true,
        ];
    }

    // SELLER / BUYER
    private static function sellerPermissions(): array
    {
        return [
            'role_level' => 'seller',
            'view_total' => false,
            'view_projects' => false,
            'view_personal' => true,
        ];
    }

    // FALLBACK
    private static function defaultPermissions(): array
    {
        return [
            'role_level' => 'default',
            'view_total' => false,
            'view_projects' => false,
            'view_personal' => false,
        ];
    }
}
