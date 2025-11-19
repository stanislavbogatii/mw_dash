<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Currency;
use Inertia\Inertia;
use App\Models\Project;

class CurrencyController extends Controller
{
    public function index()
    {
        $filters = request()->all(['dateStart', 'dateEnd', 'project_id']);
        
        if (!isset($filters['dateStart'])) {
            $filters['dateStart'] = now()->format('Y-m-d');
        }
        $currencies = Currency::with(['project'])
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

        return Inertia::render('currencies/index', [
            'currencies' => $currencies,
            'projects' => Project::select('id', 'name', 'currency_code')->get(),
            'filters' => request()->all(['dateStart', 'dateEnd', 'project_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('currencies/create', [
            'projects' => Project::select('id', 'name', 'currency_code')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'name'       => ['nullable', 'string', 'max:255'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);
        
        Currency::create($validated);

        return redirect()->route('currencies.index')
            ->with('success', 'Currency created successfully');
    }

    public function storeApi(Request $request)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'name'       => ['nullable', 'string', 'max:255'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        
        $currency = Currency::create($validated);

        return response()->json([
            'message' => 'Currency created successfully',
            'currency' => $currency
        ]);    
    }

    public function edit(Currency $currency)
    {
        return Inertia::render('currencies/edit', [
            'currency' => $currency->load(['project']),
            'projects' => Project::select('id', 'name')->get(),
        ]);
    }

    public function updateApi(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'name'       => ['nullable', 'string', 'max:255'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $currency->update($validated); 

        return response()->json([
            'success' => true,
            'message' => 'Currency updated successfully',
            'currency' => $currency
        ]);
    }

    public function update(Request $request, Currency $currency)
    {
        $validated = $request->validate([
            'date'       => ['required', 'date'],
            'amount'     => ['required', 'numeric', 'min:0.01'],
            'name'       => ['nullable', 'string', 'max:255'],
            'project_id' => ['nullable', 'exists:projects,id'],
        ]);

        $currency->update($validated);

        return redirect()->route('currencies.index')
            ->with('success', 'Currency updated successfully');
    }

    public function destroy(Currency $currency)
    {
        $currency->delete();

        return redirect()->route('currencies.index')
            ->with('success', 'Currency deleted');
    }
}
