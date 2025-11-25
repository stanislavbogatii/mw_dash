<?php

namespace App\Utils;

use App\Models\Currency;
use Illuminate\Support\Collection;

class CurrencyHelper
{
    public static function setCurrencyToDeposits(Collection $deposits): Collection
    {
        $lastDate = null;
        $lastCurrency = null;

        foreach ($deposits as $deposit) {
            if ($deposit->date === $lastDate) {
                $deposit->currency = $lastCurrency;
            } else {
                $currency = Currency::where('date', $deposit->date)
                    ->where('project_id', $deposit->project_id)
                    ->first();

                $lastDate = $deposit->date;
                $lastCurrency = $currency;
                $deposit->currency = $currency;
            }
        }

        return $deposits;
    }
}
