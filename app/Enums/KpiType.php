<?php

namespace App\Enums;

enum KpiType : string
{
    case SPEND = 'SPEND';
    case TOTAL_DEPOSITS = 'TOTAL_DEPOSITS';
    case INCOME = 'INCOME';
}
