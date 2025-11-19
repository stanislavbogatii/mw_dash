<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Currency extends Model
{
    protected $table = 'currencies';
    protected $fillable = [
        'name',
        'symbol',
        'date',
        'project_id',
        'amount'
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'float'
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
