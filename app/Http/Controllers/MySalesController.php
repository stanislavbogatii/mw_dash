<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\Commission;
use App\Models\Project;
use App\Models\Shift;
use Illuminate\Http\Request;
use Inertia\Inertia;


class MySalesController extends Controller
{
    public function index(Request $request)
    {

        $user = $request->user();

        $filters = request()->all(['dateStart', 'dateEnd', 'project_id', 'type', 'status', 'commission_id']);

        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $deposits = Deposit::with(['project'])
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
            ->when($filters['commission_id'], fn($q, $val) =>
                $q->where('commission_id', $val)
            )
            ->when($filters['type'], fn($q, $val) =>
                $q->where('type', $val)
            )
            ->when($filters['status'], fn($q, $val) =>
                $q->where('status', $val)
            )
            ->orderBy('date', 'desc')
            ->get();

        // Exemplu de structură:
        // [
        //   '2025-01-20' => [1,2,5],
        //   '2025-01-21' => [3,4]
        // ]
        $projectsByDate = $this->getProjectsByDateForUser($user->id, $filters['dateStart'], $filters['dateEnd']);

        return Inertia::render('mysales/index', [
            'deposits' => $deposits,
            'commissions' => Commission::select('id', 'name', 'order', 'project_id')->get(),
            'projects' => Project::select('id', 'name')->get(),
            'projectsByDate' => $projectsByDate,
            'filters' => $filters,
        ]);
    }


    public function updateApi(Request $request, Deposit $deposit)
    {
        $validated = $request->validate([
            'date'        => ['required', 'date'],
            'time'        => ['required', 'date_format:H:i:s'],
            'commission_id' => ['nullable', 'exists:commissions,id'],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'type'        => ['required'],
            'status'      => ['required'],
            'project_id'  => ['nullable', 'exists:projects,id'],
        ]);

        $deposit->update($validated);

        return response()->json([
            'success' => true,
            'deposit' => $deposit,
        ]);
    }

    private function getProjectsByDateForUser(int $userId, ?string $dateStart = null, ?string $dateEnd = null): array
    {
        $query = Shift::where('user_id', $userId);

        // if ($dateStart) {
            // $query = $query->where('date', '>=', $dateStart);
        // }
        $date5DaysAgo = now()->subDays(5)->format('Y-m-d');
        $query = $query->where('date', '>=', $date5DaysAgo);

        // if ($dateEnd) {
            // $query = $query->where('date', '<=', $dateEnd);
        // }

        $shifts = $query
        ->selectRaw('DATE(date) as date_only, project_id')
        ->get()
        ->groupBy('date_only')
        ->mapWithKeys(function ($shifts, $date) {
            return [$date => $shifts->pluck('project_id')->toArray()];
        })
        ->toArray();

        return $shifts;
    }

    // API pentru creare rapidă
    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'         => ['required', 'date'],
            'time'         => ['required', 'date_format:H:i:s'],
            'amount'       => ['required', 'numeric', 'min:0.01'],
            'type'         => ['required'],
            'status'       => ['required'],
            'commission_id'=> ['nullable', 'exists:commissions,id'],
            'project_id'   => ['required', 'exists:projects,id'],
        ]);

        $validated['user_id'] = $request->user()->id;

        $deposit = Deposit::create($validated);

        return response()->json([
            'success' => true,
            'deposit' => $deposit,
        ]);
    }
}
