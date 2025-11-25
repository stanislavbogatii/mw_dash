<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Services\Dashboard\DashboardResolver;


use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->input('date', now()->format('Y-m-d'));

        $provider = DashboardResolver::resolve($request->user());

        return Inertia::render(
            $provider->getView(),
            $provider->getData($request->user(), $date)
        );
    }

}
