<?php

namespace App\Enums;

enum ShiftType : string
{
    case FD = 'first_deposit';
    case RD = 'recurring_deposit';
    case ALL = 'all_shifts';

    public static function fromShort(string $value): self
    {
        return match ($value) {
            'FD'  => self::FD,
            'RD'  => self::RD,
            'ALL' => self::ALL,
            default => throw new \InvalidArgumentException(),
        };
    }

}

