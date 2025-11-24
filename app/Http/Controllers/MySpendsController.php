<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Spend;
use Inertia\Inertia;
use App\Models\Project;

class MySpendsController extends Controller
{
    public function index(Request $request)
    {

        $user = $request->user();

        $filters = request()->all(['dateStart', 'dateEnd', 'project_id']);

        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d'); 
        }

        $spends = Spend::with(['project'])
            ->where('user_id', $user->id)
            ->when($filters['dateStart'], fn($q, $val) =>
                $q->where('date', '>=', $val)
            )
            ->when($filters['dateEnd'], fn($q, $val) =>
                $q->where('date', '<=', $val)
            )
            ->when($filters['project_id'], fn($q, $val) =>
                $q->where('project_id', $val)
            )
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('myspends/index', [
            'spends' => $spends,
            'projects' => Project::select('id', 'name')->get(),
            'filters' => $filters,
        ]);
    }

    // API pentru creare rapidă
    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'         => ['required', 'date'],
            'amount'       => ['required', 'numeric', 'min:0'],
            'subscribers'  => ['nullable', 'numeric', 'min:0'],
            'dialogs'      => ['nullable', 'numeric', 'min:0'],
            'project_id'   => ['required', 'exists:projects,id'],
        ]);

        $validated['user_id'] = $request->user()->id;

        $spend = Spend::create($validated);

        return response()->json([
            'success' => true,
            'spend' => $spend,
        ]);
    }

    public function updateApi(Request $request, Spend $mySpend)
    {
        $validated = $request->validate([
            'date'         => ['required', 'date'],
            'amount'       => ['required', 'numeric'],
            'subscribers'  => ['nullable', 'numeric'],
            'dialogs'      => ['nullable', 'numeric'],
            'project_id'   => ['required', 'exists:projects,id'],
        ]);

        $mySpend->update($validated);

        return response()->json([
            'success' => true,
            'spend' => $mySpend,
        ]);
    }
}
