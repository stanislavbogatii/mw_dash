<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commission extends Model
{
    protected $table = 'commissions';
    
    protected $fillable = [
        'amount',
        'name',
        'order',
        'project_id',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }
}
