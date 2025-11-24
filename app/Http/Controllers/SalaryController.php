<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class SalaryController extends Controller
{
    public function index() 
    {
        User::findAll
    }
}
