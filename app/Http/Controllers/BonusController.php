<?php

namespace App\Http\Controllers;

use App\Models\Bonus;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\User;    

class BonusController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id']);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $bonus = Bonus::with(['project', 'user'])
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

        return Inertia::render('bonus/index', [
            'bonus' => $bonus,
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('bonus/create', [
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'comment' => ['nullable', 'string'],
            'user_id'    => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric'],
        ]);
        
        Bonus::create($validated);

        return redirect()->route('bonus.index')
            ->with('success', 'Bonus created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['required', 'exists:users,id'],
            'comment' => ['nullable', 'string'],
            'amount' => ['required', 'numeric'],
        ]);

        
        $bonus = Bonus::create($validated);

        return response()->json([
            'message' => 'Bonus created successfully',
            'bonus' => $bonus
        ]);    
    }

    public function edit(Bonus $bonus)
    {
        return Inertia::render('bonus/edit', [
            'bonus' => $bonus->load(['project', 'user']),
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->get(),
        ]);
    }

    public function updateApi(Request $request, Bonus $bonus)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['required', 'exists:users,id'],
            'comment' => ['nullable', 'string'],
            'amount' => ['required', 'numeric'],
        ]);

        $bonus->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'Bonus updated successfully',
            'bonus' => $bonus
        ]);
    }

    public function update(Request $request, Bonus $bonus)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'comment' => ['nullable', 'string'],
            'user_id'    => ['required', 'exists:users,id'],
            'amount' => ['required', 'numeric'],
        ]);

        $bonus->update($validated);

        return redirect()->route('bonus.index')
            ->with('success', 'Bonus updated successfully');
    }

    public function destroy(Bonus $bonus)
    {
        $bonus->delete();

        return redirect()->route('bonus.index')
            ->with('success', 'Bonus deleted');
    }
}
