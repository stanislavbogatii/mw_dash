import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRoles } from '@/lib/useRoles';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

import TopMetrics from '@/components/dashboard/TopMetrics';
import ProjectMetrics from '@/components/dashboard/ProjectMetrics';
import TodayShifts from '@/components/dashboard/TodayShifts';
import KpiOverview from '@/components/dashboard/KpiOverview';

import { groupByProject } from "@/utils/dashboard/groupData";
import Deposit from '@/models/Deposit';
import Spend from '@/models/Spend';
import Shift from '@/models/Shift';
import Project from '@/models/Project';
import Kpi from '@/models/Kpi';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

type Props = {
    deposits: Deposit[];
    spends: Spend[];
    shifts: Shift[];
    projects: Project[];
    kpi: Kpi[];
}

export default function Dashboard({ deposits, spends, shifts, projects, kpi } : Props) {
    const { hasAnyRole, user } = useRoles();

    // Read initial date from URL
    const initialDate = new URLSearchParams(window.location.search).get("date") ?? new Date().toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState<string>(initialDate);

    const depositsByProject: any = groupByProject(deposits);
    const spendsByProject: any = groupByProject(spends);
    const shiftsByProject: any = groupByProject(shifts);
    const kpiByProject: any = groupByProject(kpi);

    // -------------------------------
    // When date changes → reload page
    // -------------------------------
    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);

        if (!newDate) {
            // Clear date
            router.get('/dashboard', {}, { replace: true });
        } else {
            // Send date to backend
            router.get('/dashboard', { date: newDate }, { replace: true });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">

                <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl bg-white/50 dark:bg-neutral-900/50">

                    {/* DATE FILTER */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => handleDateChange(e.target.value)}
                            className="border rounded px-3 py-2 bg-white dark:bg-neutral-800"
                        />
                    </div>

                    {/* CLEAR FILTER */}
                    {selectedDate && (
                        <div className="flex flex-col justify-end">
                            <button
                                onClick={() => handleDateChange("")}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                            >
                                Clear Date
                            </button>
                        </div>
                    )}

                </div>


                {hasAnyRole(["owner", "buyier"]) && (
                    <TopMetrics 
                    deposits={deposits} spends={spends} shifts={shifts} />
                )}

                {hasAnyRole(["buyier", "owner", "sales_manager"]) && (
                    <ProjectMetrics
                        projects={projects}
                        depositsByProject={depositsByProject}
                        spendsByProject={spendsByProject}
                        shiftsByProject={shiftsByProject}
                    />
                )}

                {hasAnyRole(['owner', 'buyier', 'sales_manager']) && (
                    <TodayShifts
                        projects={projects}
                        shiftsByProject={shiftsByProject}
                    />
                )}

                {hasAnyRole(["buyier", "owner", "sales_manager"]) && (
                    <KpiOverview
                        projects={projects}
                        kpiByProject={kpiByProject}
                    />
                )}
            </div>
        </AppLayout>
    );
}
