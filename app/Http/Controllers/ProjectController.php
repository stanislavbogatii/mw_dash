<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('projects/index', [
            'projects' => Project::orderBy('id', 'desc')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('projects/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'currency_code' => ['nullable', 'string', 'max:255'],
        ]);

        Project::create($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project created successfully');
    }

    public function edit(Project $project)
    {
        return Inertia::render('projects/edit', [
            'project' => $project,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'currency_code' => ['nullable', 'string', 'max:255'],
        ]);

        $project->update($validated);

        return redirect()->route('projects.index')
            ->with('success', 'Project updated successfully');
    }

    public function destroy(Project $project)
    {
        $project->delete();

        return redirect()->route('projects.index')
            ->with('success', 'Project deleted');
    }
}
