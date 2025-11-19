<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Kpi;
use App\Models\Project;

class KpiController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'project_id']);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $kpi = Kpi::with(['project'])
            ->when($filters['dateStart'] ?? null, fn($q, $val) =>
                $q->where('date', '>=', $val)
            )
            ->when($filters['dateEnd'] ?? null, fn($q, $val) =>
                $q->where('date', '<=', $val)
            )
            ->when($filters['project_id'] ?? null, fn($q, $val) =>
                $q->where('project_id', $val)
            )
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('kpi/index', [
            'kpi' => $kpi,
            'projects' => Project::select('id', 'name')->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'project_id', 'code']),
        ]);
    }

    public function create()
    {
        return Inertia::render('kpi/create', [
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'total_spend' => ['required', 'numeric'],
            'total_subscribers' => ['nullable', 'numeric'],
            'total_dialogs' => ['nullable', 'numeric'],
            'total_income' => ['nullable', 'numeric'],
            'total_deposits' => ['nullable', 'numeric'],
            'fd_income' => ['nullable', 'numeric'],
            'rd_income' => ['nullable', 'numeric'],
            'fd_deposits' => ['nullable'],
            'rd_deposits' => ['nullable', 'numeric'],
        ]);
        
        Kpi::create($validated);

        return redirect()->route('kpi.index')
            ->with('success', 'Kpi created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'total_spend' => ['required', 'numeric'],
            'total_subscribers' => ['nullable', 'numeric'],
            'total_dialogs' => ['nullable', 'numeric'],
            'total_income' => ['nullable', 'numeric'],
            'total_deposits' => ['nullable', 'numeric'],
            'fd_income' => ['nullable', 'numeric'],
            'rd_income' => ['nullable', 'numeric'],
            'fd_deposits' => ['nullable'],
            'rd_deposits' => ['nullable', 'numeric'],
        ]);

        
        $kpi = Kpi::create($validated);

        return response()->json([
            'message' => 'Kpi created successfully',
            'kpi' => $kpi
        ]);    
    }

    public function edit(Kpi $kpi)
    {
        return Inertia::render('kpi/edit', [
            'kpi' => $kpi->load(['project', 'user']),
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    public function updateApi(Request $request, Kpi $kpi)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'total_spend' => ['required', 'numeric'],
            'total_subscribers' => ['nullable', 'numeric'],
            'total_dialogs' => ['nullable', 'numeric'],
            'total_income' => ['nullable', 'numeric'],
            'total_deposits' => ['nullable', 'numeric'],
            'fd_income' => ['nullable', 'numeric'],
            'rd_income' => ['nullable', 'numeric'],
            'fd_deposits' => ['nullable'],
            'rd_deposits' => ['nullable', 'numeric'],
        ]);

        $kpi->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'Kpi updated successfully',
            'kpi' => $kpi
        ]);
    }

    public function update(Request $request, Kpi $kpi)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'total_spend' => ['required', 'numeric'],
            'total_subscribers' => ['nullable', 'numeric'],
            'total_dialogs' => ['nullable', 'numeric'],
            'total_income' => ['nullable', 'numeric'],
            'total_deposits' => ['nullable', 'numeric'],
            'fd_income' => ['nullable', 'numeric'],
            'rd_income' => ['nullable', 'numeric'],
            'fd_deposits' => ['nullable'],
            'rd_deposits' => ['nullable', 'numeric'],
        ]);

        $kpi->update($validated);

        return redirect()->route('kpi.index')
            ->with('success', 'Kpi updated successfully');
    }

    public function destroy(Kpi $kpi)
    {
        $kpi->delete();

        return redirect()->route('kpi.index')
            ->with('success', 'Kpi deleted');
    }
}
