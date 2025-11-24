<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kpi extends Model
{
    protected $table = 'kpi';

    protected $fillable = [
        'date',
        'project_id',
        'total_spend',
        'total_subscribers',
        'total_dialogs',
        'total_income',
        'total_deposits',
        'fd_income',
        'rd_income',
        'fd_deposits',
        'rd_deposits',
    ];

    protected $casts = [
        'total_income'   => 'float',
        'total_spend'    => 'float',
        'fd_income'      => 'float',
        'rd_income'      => 'float',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
