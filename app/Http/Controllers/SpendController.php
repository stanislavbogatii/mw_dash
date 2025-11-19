<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Spend;
use App\Models\Project;
use App\Models\User;
use Inertia\Inertia;


class SpendController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id']);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $spend = Spend::with(['project'])
            ->when($filters['dateStart'] ?? null, fn($q, $val) =>
                $q->where('date', '>=', $val)
            )
            ->when($filters['dateEnd'] ?? null, fn($q, $val) =>
                $q->where('date', '<=', $val)
            )
            ->when($filters['project_id'] ?? null, fn($q, $val) =>
                $q->where('project_id', $val)
            )
            ->when($filters['user_id'] ?? null, fn($q, $val) =>
                $q->where('user_id', $val)
            )
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('spend/index', [
            'spend' => $spend,
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->role('buyier')
            ->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('spend/create', [
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->role('buyier')
            ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric'],
        ]);
        
        Spend::create($validated);

        return redirect()->route('spend.index')
            ->with('success', 'Spend created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric'],
        ]);

        
        $spend = Spend::create($validated);

        return response()->json([
            'message' => 'Spend created successfully',
            'spend' => $spend
        ]);    
    }

    public function edit(Spend $spend)
    {
        return Inertia::render('spend/edit', [
            'spend' => $spend->load(['project', 'user']),
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->role('buyier')
            ->get(),
        ]);
    }

    public function updateApi(Request $request, Spend $spend)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric'],
        ]);

        $spend->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'Spend updated successfully',
            'spend' => $spend
        ]);
    }

    public function update(Request $request, Spend $spend)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric'],
        ]);

        $spend->update($validated);

        return redirect()->route('spend.index')
            ->with('success', 'Spend updated successfully');
    }

    public function destroy(Spend $spend)
    {
        $spend->delete();

        return redirect()->route('spend.index')
            ->with('success', 'Spend deleted');
    }
}
