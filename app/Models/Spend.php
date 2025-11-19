<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Spend extends Model
{
    protected $table = 'spends';

    protected $fillable = [
        'date',
        'project_id',
        'user_id',
        'amount',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
