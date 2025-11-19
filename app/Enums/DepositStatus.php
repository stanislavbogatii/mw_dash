<?php

namespace App\Enums;

enum DepositStatus : string
{
    case PAID = 'PAID';
    case PENDING = 'PENDING';
    case FAILED = 'FAILED';

    public static function getValue(string $status): string
    {
        return match ($status) {
            self::PAID->value => self::PAID->value,
            self::PENDING->value => self::PENDING->value,
            self::FAILED->value => self::FAILED->value,
            default => self::PENDING->value,
        };
    }
}
