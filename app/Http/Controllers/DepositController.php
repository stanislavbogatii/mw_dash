<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\User;
use App\Models\Project;
use App\Models\Commission;
use App\Enums\DepositType;
use App\Enums\DepositStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;


class DepositController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'amountMin', 'amountMax', 'user_id', 'project_id', 'type', 'status', 'commission_id']);
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }

        $deposits = Deposit::with(['user', 'project'])
            ->when($filters['dateStart'] ?? null, fn($q, $val) =>
                $q->where('date', '>=', $val)
            )
            ->when($filters['dateEnd'] ?? null, fn($q, $val) =>
                $q->where('date', '<=', $val)
            )    
            ->when($filters['amountMin'] ?? null, fn($q, $val) =>
                $q->where('amount', '>=', $val)
            )
            ->when($filters['amountMax'] ?? null, fn($q, $val) =>
                $q->where('amount', '<=', $val)
            )
            ->when($filters['user_id'] ?? null, fn($q, $val) =>
                $q->where('user_id', $val)
            )
            ->when($filters['project_id'] ?? null, fn($q, $val) =>
                $q->where('project_id', $val)
            )
            ->when($filters['commission_id'] ?? null, fn($q, $val) =>
                $q->where('commission_id', $val)
            )
            ->when($filters['type'] ?? null, fn($q, $val) =>
                $q->where('type', $val)
            )
            ->when($filters['status'] ?? null, fn($q, $val) =>
                $q->where('status', $val)
            )
            ->orderBy('date', 'desc')
            ->get();
       
            return Inertia::render('deposits/index', [
                'deposits' => $deposits,
                'commissions' => Commission::select('id', 'name', 'order')->get(),
                'users'  => User::select('id', 'name')->get(),
                'projects' => Project::select('id', 'name')->get(),
                'filters' => request()->all(['dateStart', 'dateEnd', 'amountMin', 'amountMax', 'user_id', 'project_id', 'type', 'status']),
            ]);
    }

    public function create()
    {
        return Inertia::render('deposits/create', [
            'users'    => User::select('id', 'name')->get(),
            'commissions' => Commission::select('id', 'name', 'order')->get(),
            'projects' => Project::select('id', 'name')->get(),
            'types'    => array_column(DepositType::cases(), 'value'),
            'statuses' => array_column(DepositStatus::cases(), 'value'),
        ]);
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'        => ['required', 'date'],
            'time'        => ['required', 'date_format:H:i:s'],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'type'        => ['required', 'in:' . implode(',', array_column(DepositType::cases(), 'value'))],
            'status'      => ['required', 'in:' . implode(',', array_column(DepositStatus::cases(), 'value'))],
            'user_id'     => ['required', 'exists:users,id'],
            'commission_id' => ['nullable', 'exists:commissions,id'],
            'project_id'  => ['nullable', 'exists:projects,id'],
        ]);

        $deposit = Deposit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Deposit created successfully',
            'deposit' => $deposit,
        ], 201);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'        => ['required', 'date'],
            'time'        => ['required', 'date_format:H:i:s'],
            'commission_id' => ['nullable', 'exists:commissions,id'],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'type'        => ['required', 'in:' . implode(',', array_column(DepositType::cases(), 'value'))],
            'status'      => ['required', 'in:' . implode(',', array_column(DepositStatus::cases(), 'value'))],
            'user_id'     => ['required', 'exists:users,id'],
            'project_id'  => ['nullable', 'exists:projects,id'],
        ]);

        Deposit::create($validated);

        return redirect()->route('deposits.index')
            ->with('success', 'Deposit created successfully');
    }

    public function edit(Deposit $deposit)
    {
        return Inertia::render('deposits/edit', [
            'deposit'  => $deposit->load(['user', 'project']),
            'users'    => User::select('id', 'name')->get(),
            'commissions' => Commission::select('id', 'name', 'order')->get(),
            'projects' => Project::select('id', 'name')->get(),
            'types'    => array_column(DepositType::cases(), 'value'),
            'statuses' => array_column(DepositStatus::cases(), 'value'),
        ]);
    }

    public function updateApi(Request $request, Deposit $deposit)
    {
        $validated = $request->validate([
            'date'        => ['required', 'date'],
            'time'        => ['required', 'date_format:H:i:s'],
            'commission_id' => ['nullable', 'exists:commissions,id'],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'type'        => ['required', 'in:' . implode(',', array_column(DepositType::cases(), 'value'))],
            'status'      => ['required', 'in:' . implode(',', array_column(DepositStatus::cases(), 'value'))],
            'user_id'     => ['required', 'exists:users,id'],
            'project_id'  => ['nullable', 'exists:projects,id'],
        ]);

        $deposit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Deposit updated successfully',
            'deposit' => $deposit,
        ]);
    }

    public function update(Request $request, Deposit $deposit)
    {
        $validated = $request->validate([
            'date'        => ['required', 'date'],
            'commission_id' => ['nullable', 'exists:commissions,id'],
            'time'        => ['required', 'date_format:H:i:s'],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'type'        => ['required', 'in:' . implode(',', array_column(DepositType::cases(), 'value'))],
            'status'      => ['required', 'in:' . implode(',', array_column(DepositStatus::cases(), 'value'))],
            'user_id'     => ['required', 'exists:users,id'],
            'project_id'  => ['nullable', 'exists:projects,id'],
        ]);

        $deposit->update($validated);

        return redirect()->route('deposits.index')
            ->with('success', 'Deposit updated successfully');
    }

    public function destroy(Deposit $deposit)
    {
        $deposit->delete();

        return redirect()->route('deposits.index')
            ->with('success', 'Deposit deleted');
    }
}
