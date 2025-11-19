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

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
