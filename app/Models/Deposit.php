<?php

namespace App\Models;
use App\Enums\DepositType;
use App\Enums\DepositStatus;

use Illuminate\Database\Eloquent\Model;

class Deposit extends Model
{
    protected $table = 'deposits';

    protected $fillable = [
        'date',
        'time',
        'amount',
        'status',
        'type',
        'user_id',
        'project_id',
        'commission_id',
    ];

    protected $casts = [
        'date' => 'date',
        'type' => DepositType::class,
        'status' => DepositStatus::class,

    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function commission()
    {
        return $this->belongsTo(Commission::class);
    }

    public function withCurrency()
    {
        $currency = Currency::where('date', $this->date)
        ->where('project_id', $this->project_id)
        ->first();

        $this->currency = $currency->amount;

    }

}
