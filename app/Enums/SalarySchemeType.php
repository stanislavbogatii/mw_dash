<?php

namespace App\Enums;

enum SalarySchemeType : string
{
    case FIX = 'FIX';
    case PER_DEPOSIT = 'PER_DEPOSIT';
    case PER_INCOME = 'PER_INCOME';
    case FROM_SPEND = 'FROM_SPEND';
    case FROM_TOTAL_PROFIT = 'FROM_TOTAL_PROFIT';
    case FROM_TOTAL_INCOME = 'FROM_TOTAL_INCOME';
}
