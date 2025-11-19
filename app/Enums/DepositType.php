<?php

namespace App\Enums;

enum DepositType: string
{
    case FD = 'first_deposit';
    case RD = 'recurring_deposit';
}
