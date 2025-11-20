<?php

namespace App\Http\Controllers;

use App\Models\SalaryScheme;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\User;

use Illuminate\Http\Request;

class SalarySchemeController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id',]);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $salaryScheme = SalaryScheme::with(['project', 'user'])
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

        return Inertia::render('salary-scheme/index', [
            'salaryScheme' => $salaryScheme,
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'project_id', 'user_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('salary-scheme/create', [
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
            'user_id'    => ['nullable', 'exists:users,id'],
            'value' => ['required', 'numeric'],
            'min' => ['nullable', 'numeric'],
            'max' => ['nullable', 'numeric'],
            'type' => ['required', 'string', 'max:255'],
            'value_type' => ['required', 'string', 'max:255'],
        ]);
        
        SalaryScheme::create($validated);

        return redirect()->route('salaryScheme.index')
            ->with('success', 'Salary Scheme created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['nullable', 'exists:users,id'],
            'value' => ['required', 'numeric'],
            'min' => ['nullable', 'numeric'],
            'max' => ['nullable', 'numeric'],
            'type' => ['required', 'string', 'max:255'],
            'value_type' => ['required', 'string', 'max:255'],
        ]);

        
        $salaryScheme = SalaryScheme::create($validated);

        return response()->json([
            'message' => 'SalaryScheme created successfully',
            'salaryScheme' => $salaryScheme
        ]);    
    }

    public function edit(SalaryScheme $salaryScheme)
    {
        return Inertia::render('salary-scheme/edit', [
            'salaryScheme' => $salaryScheme->load(['project', 'user']),
            'projects' => Project::select('id', 'name')->get(),
            'users' => User::select('id', 'name')
            ->get(),
        ]);
    }

    public function updateApi(Request $request, SalaryScheme $salaryScheme)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['nullable', 'exists:users,id'],
            'value' => ['required', 'numeric'],
            'min' => ['nullable', 'numeric'],
            'max' => ['nullable', 'numeric'],
            'type' => ['required', 'string', 'max:255'],
            'value_type' => ['required', 'string', 'max:255'],
        ]);

        $salaryScheme->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'SalaryScheme updated successfully',
            'salaryScheme' => $salaryScheme
        ]);
    }

    public function update(Request $request, SalaryScheme $salaryScheme)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'project_id' => ['required', 'exists:projects,id'],
            'user_id'    => ['nullable', 'exists:users,id'],
            'value' => ['required', 'numeric'],
            'min' => ['nullable', 'numeric'],
            'max' => ['nullable', 'numeric'],
            'type' => ['required', 'string', 'max:255'],
            'value_type' => ['required', 'string', 'max:255'],
        ]);

        $salaryScheme->update($validated);

        return redirect()->route('salaryScheme.index')
            ->with('success', 'Salary Scheme updated successfully');
    }

    public function destroy(SalaryScheme $salaryScheme)
    {
        $salaryScheme->delete();

        return redirect()->route('salary-scheme.index')
            ->with('success', 'Salary Scheme deleted');
    }
}
