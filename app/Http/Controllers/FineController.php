<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Fine;
use App\Models\User;
use App\Models\Project;

class FineController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id', 'type']);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $fines = Fine::with(['project', 'user'])
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
            ->when($filters['type'] ?? null, fn($q, $val) =>
                $q->where('type', $val)
            )
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('fines/index', [
            'fines' => $fines,
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'project_id', 'code']),
        ]);
    }

    public function create()
    {
        return Inertia::render('fines/create', [
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
            'type'       => ['required', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);
        
        Fine::create($validated);

        return redirect()->route('fines.index')
            ->with('success', 'Fine created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
            'type'       => ['required', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        
        $fine = Fine::create($validated);

        return response()->json([
            'message' => 'Fine created successfully',
            'fine' => $fine
        ]);    
    }

    public function edit(Fine $fine)
    {
        return Inertia::render('fines/edit', [
            'fine' => $fine->load(['project', 'user']),
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')->get(),
        ]);
    }

    public function updateApi(Request $request, Fine $fine)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'type'       => ['required', 'string', 'max:255'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $fine->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'Fine updated successfully',
            'fine' => $fine
        ]);
    }

    public function update(Request $request, Fine $fine)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'description' => ['nullable', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'type'       => ['required', 'string', 'max:255'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $fine->update($validated);

        return redirect()->route('fines.index')
            ->with('success', 'Fine updated successfully');
    }

    public function destroy(Fine $fine)
    {
        $fine->delete();

        return redirect()->route('fines.index')
            ->with('success', 'Fine deleted');
    }
}
