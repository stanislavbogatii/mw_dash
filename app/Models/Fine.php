<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fine extends Model
{
    protected $table = 'fines';

    protected $fillable = [
        'user_id',
        'project_id',
        'description',
        'date',
        'amount',
        'type',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
