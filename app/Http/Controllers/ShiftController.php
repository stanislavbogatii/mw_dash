<?php

namespace App\Http\Controllers;

use App\Enums\ShiftType;
use App\Models\Shift;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShiftController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'user_id', 'project_id', 'type']);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $shifts = Shift::with(['user', 'project'])
            ->when($filters['dateStart'] ?? null, fn($q, $val) =>
                $q->where('date', '>=', $val)
            )
            ->when($filters['dateEnd'] ?? null, fn($q, $val) =>
                $q->where('date', '<=', $val)
            )
            ->when($filters['user_id'] ?? null, fn($q, $val) =>
                $q->where('user_id', $val)
            )
            ->when($filters['project_id'] ?? null, fn($q, $val) =>
                $q->where('project_id', $val)
            )
            ->when($filters['type'] ?? null, fn($q, $val) =>
                $q->where('type', $val)
            )
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('shifts/index', [
            'shifts' => $shifts,
            'users'  => User::select('id', 'name')->get(),
            'projects' => Project::select('id', 'name')->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'user_id', 'project_id', 'type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('shifts/create', [
            'users'    => User::select('id', 'name')->get(),
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'start_time'       => ['nullable', 'date_format:H:i:s'],
            'end_time'       => ['nullable', 'date_format:H:i:s'],
            'type'       => ['required', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $validated['type'] = ShiftType::fromShort($validated['type']);
        
        Shift::create($validated);

        return redirect()->route('shifts.index')
            ->with('success', 'Shift created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'start_time'       => ['nullable', 'date_format:H:i:s'],
            'end_time'       => ['nullable', 'date_format:H:i:s'],
            'type'       => ['required', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $validated['type'] = ShiftType::fromShort($validated['type']);
        
        $shift = Shift::create($validated);

        return response()->json([
            'message' => 'Shift created successfully',
            'shift' => $shift
        ]);    
    }

    public function edit(Shift $shift)
    {
        return Inertia::render('shifts/edit', [
            'shift'    => $shift->load(['user', 'project']),
            'users'    => User::select('id', 'name')->get(),
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    public function updateApi(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i:s'],
            'end_time'   => ['nullable', 'date_format:H:i:s'],
            'type'       => ['required', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $shift->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'Shift updated successfully',
            'shift' => $shift
        ]);
    }

    public function update(Request $request, Shift $shift)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'start_time' => ['nullable', 'date_format:H:i:s'],
            'end_time'   => ['nullable', 'date_format:H:i:s'],
            'type'       => ['required', 'string', 'max:255'],
            'user_id'    => ['required', 'exists:users,id'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        // $validated['type'] = ShiftType::fromShort($validated['type']);

        $shift->update($validated);

        return redirect()->route('shifts.index')
            ->with('success', 'Shift updated successfully');
    }

    public function destroy(Shift $shift)
    {
        $shift->delete();

        return redirect()->route('shifts.index')
            ->with('success', 'Shift deleted');
    }
}
