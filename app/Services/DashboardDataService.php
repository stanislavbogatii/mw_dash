<?php

namespace App\Services;

use App\Models\Deposit;
use App\Models\Spend;
use App\Models\Shift;
use App\Models\Project;
use App\Models\Kpi;

use App\Models\User;
use Illuminate\Support\Collection;

class DashboardDataService
{
    protected User $user;
    protected array $policy;
    protected string $date;

    public static function for(User $user): self
    {
        $service = new self;
        $service->user = $user;
        $service->policy = DashboardPolicyService::getPermissions($user);
        $service->date = now()->format('Y-m-d');
        return $service;
    }

    public function date(string $date): self
    {
        $this->date = $date;
        return $this;
    }

    public function get(): array
    {
        return [
            'labels' => $this->getLabels(),
            'deposits' => $this->getDeposits(),
            'spends' => $this->getSpends(),
            'projects' => $this->getProjects(),
            'shifts' => $this->getShifts(),
            'kpi' => $this->getKpi(),
        ];
    }

    private function getDeposits()
    {
        if ($this->policy['view_total']) {
            return Deposit::with(['user:id,name,username','project:id,name'])
                ->where('date', $this->date)->get();
        }

        return Deposit::with(['user:id,name,username','project:id,name'])
            ->where('date', $this->date)
            ->where('user_id', $this->user->id)
            ->get();
    }

    private function getSpends()
    {
        if ($this->policy['view_total']) {
            return Spend::with(['user:id,name,username','project:id,name'])
                ->where('date', $this->date)->get();
        }

        return Spend::with(['user:id,name,username','project:id,name'])
            ->where('date', $this->date)
            ->where('user_id', $this->user->id)
            ->get();
    }

    private function getShifts()
    {
        if ($this->policy['view_total']) {
            return Shift::with(['user:id,name,username','project:id,name'])
                ->where('date', $this->date)->get();
        }

        return Shift::with(['user:id,name,username','project:id,name'])
            ->where('date', $this->date)
            ->where('user_id', $this->user->id)
            ->get();
    }

    private function getProjects()
    {
        if ($this->policy['view_total']) {
            return Project::select('id', 'name')->get();
        }

        $projectIds = Shift::where('user_id', $this->user->id)
            ->where('date', $this->date)
            ->pluck('project_id');

        return Project::select('id', 'name')
            ->whereIn('id', $projectIds)
            ->get();
    }

    private function getKpi()
    {
        if ($this->policy['view_projects']) {
            return Kpi::where('date', $this->date)->get();
        }

        $projectIds = Shift::where('user_id', $this->user->id)
            ->where('date', $this->date)
            ->pluck('project_id');
        

        $kpi = Kpi::where('date', $this->date)
            ->whereIn('project_id', $projectIds)
            ->get();

        return $kpi;
    }


    private function getLabels(): array
    {
        if ($this->policy['view_total'] && $this->policy['view_personal']) {
            return [
                'deposits' => 'Deposits',
                'spends' => 'Spends',
                'projects' => 'Project Metrics',
                'shifts' => "Today's Shifts",
                'kpi' => 'KPI Overview',
            ];
        }

        if (!$this->policy['view_total'] && $this->policy['view_personal']) {
            return [
                'deposits' => 'My Deposits',
                'spends' => 'My Spends',
                'projects' => 'Project Metrics',
                'shifts' => 'Today Shifts',
                'kpi' => 'Today KPI',
            ];
        }

        return [
            'deposits' => 'Deposits',
            'spends' => 'Spends',
            'projects' => 'Projects',
            'shifts' => 'Shifts',
            'kpi' => 'KPI',
        ];
    }

}
