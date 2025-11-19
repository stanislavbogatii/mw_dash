<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Commission;
use App\Models\Project;

class CommissionController extends Controller
{

    public function index()
    {
        $filters = request()->all(['project_id']);
        $commissions = Commission::with(['project']);
        $projects = Project::select('id', 'name')->get();

        if (isset($filters['project_id'])) {
            $commissions = $commissions->where('project_id', $filters['project_id']);
        } else {
            $firstProjectId = $projects->first()->select('id')->get()->first()->id;
            $commissions = $commissions->where('project_id', $firstProjectId);
        }

        $commissions = $commissions->orderBy('order', 'asc')->get();

        return Inertia::render('commissions/index', [
            'commissions' => $commissions,
            'projects' => $projects,
            'filters' => $filters
        ]);
    }

    public function create()
    {
        $projects = Project::select('id', 'name')->get();
        return Inertia::render('commissions/create', [
            'projects' => $projects
        ]);
    }

    public function reorderApi(Request $request)
    {
        foreach ($request->order as $item) {
            Commission::where('id', $item['id'])
                ->update(['order' => $item['order']]);
        }

        return response()->json(['success' => true]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'name'   => ['required', 'string', 'max:255'],
            'order'  => ['required', 'integer'],
            'project_id' => ['required', 'exists:projects,id'],
        ]);

        Commission::create($validated);

        return redirect()->route('commissions.index')
            ->with('success', 'Commission created successfully');
    }   

    public function edit(Commission $commission)
    {
        return Inertia::render('commissions/edit', [
            'commission' => $commission,
        ]);
    }

    public function update(Request $request, Commission $commission)
    {
        $validated = $request->validate([
            'commission' => ['required', 'numeric', 'min:0.01'],
        ]);

        $commission->update($validated);

        return redirect()->route('commissions.index')
            ->with('success', 'Commission updated successfully');
    }
}
