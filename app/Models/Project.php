<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $table = 'projects';

    protected $fillable = [
        'name',
        'currency_code'
    ];

    public function commissions()
    {
        return $this->hasMany(Commission::class);
    }   

    public function currencies()
    {
        return $this->hasMany(Currency::class);
    }

    public function deposits()
    {
        return $this->hasMany(Deposit::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    public function kpi()
    {
        return $this->hasMany(Kpi::class);
    }

    public function spends()
    {
        return $this->hasMany(Spend::class);
    }
}
