<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SalaryScheme extends Model
{
    protected $table = 'salary_schemes';    

    protected $fillable = [
        'date',
        'value',
        'min',
        'max',
        'type',
        'value_type',
        'position_type',
        'project_id',
        'user_id',
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
