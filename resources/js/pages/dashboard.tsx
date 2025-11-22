import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
];

// TYPES
type User = { id: number; name: string };
type Project = { id: number; name: string };

enum DepositType {
    FD = 'first_deposit',
    RD = 'recurring_deposit',
}

enum DepositStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

type Commission = {
    id: number;
    name: string;
    order: number;
};

type Deposit = {
    id: number;
    date: string;
    time: string;
    amount: string;
    status: DepositStatus;
    user_id: number;
    project_id: number;
    commission_id: number;
    commission: Commission;
    type: DepositType;
    user: User | null;
    project: Project | null;
};

enum ShiftType {
    FD = 'first_deposit',
    RD = 'recurring_deposit',
    ALL = 'all_shifts',
}

type Shift = {
    id: number;
    date: string;
    start_time: string | null;
    end_time: string | null;
    type: ShiftType;
    user: User | null;
    project: Project | null;
    project_id: number;
};

type Spend = {
    id: number;
    date: string;
    project_id: number;
    user_id: number;
    amount: number;
};

type Props = {
    deposits: Deposit[];
    spends: Spend[];
    shifts: Shift[];
    projects: Project[];
};

export default function Dashboard({ deposits, spends, shifts, projects }: Props) {
    // GROUPING BY PROJECT
    const depositsByProject = Object.groupBy(deposits, d => d.project_id);
    const shiftsByProject = Object.groupBy(shifts, s => s.project_id);
    const spendsByProject = Object.groupBy(spends, s => s.project_id);

    const totalDeposits = deposits.reduce((a, d) => a + parseFloat(d.amount), 0);
    const totalSpends = spends.reduce((a, s) => a + s.amount, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">

                {/* TOP METRICS */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Deposits */}
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5 flex flex-col items-center text-center bg-white/40 dark:bg-neutral-900/40">
                        <div className="text-lg font-medium">Total Deposits</div>
                        <div className="text-4xl font-bold mt-2">{deposits.length}</div>
                        <div className="text-2xl text-green-600 dark:text-green-400 mt-2">
                            ${totalDeposits.toFixed(2)}
                        </div>
                    </div>

                    {/* Shifts */}
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5 flex flex-col items-center text-center bg-white/40 dark:bg-neutral-900/40">
                        <div className="text-lg font-medium">Total Shifts</div>
                        <div className="text-4xl font-bold mt-2">{shifts.length}</div>
                    </div>

                    {/* Spends */}
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-5 flex flex-col items-center text-center bg-white/40 dark:bg-neutral-900/40">
                        <div className="text-lg font-medium">Total Spends</div>
                        <div className="text-4xl font-bold mt-2">${totalSpends.toFixed(2)}</div>
                    </div>
                </div>

                {/* PER PROJECT METRICS */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 bg-white/50 dark:bg-neutral-900/50">
                    <h2 className="text-xl font-semibold mb-6">Project Metrics</h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map(project => {
                            const dp = depositsByProject[project.id] ?? [];
                            const sp = spendsByProject[project.id] ?? [];
                            const sh = shiftsByProject[project.id] ?? [];

                            const sumDeposits = dp.reduce((a, d) => a + parseFloat(d.amount), 0);
                            const sumSpends = sp.reduce((a, s) => a + s.amount, 0);

                            return (
                                <div
                                    key={project.id}
                                    className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4 bg-white/40 dark:bg-neutral-900/40"
                                >
                                    <div className="text-lg font-bold mb-4">{project.name}</div>

                                    <div className="space-y-2">
                                        {/* Deposits */}
                                        <div className="flex justify-between">
                                            <span className="font-medium">Deposits:</span>
                                            <span className="font-semibold">{dp.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Deposits Sum:</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                ${sumDeposits.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Shifts */}
                                        <div className="flex justify-between">
                                            <span className="font-medium">Shifts:</span>
                                            <span className="font-semibold">{sh.length}</span>
                                        </div>

                                        {/* Spends */}
                                        <div className="flex justify-between">
                                            <span className="font-medium">Spends Sum:</span>
                                            <span className="font-semibold text-red-600 dark:text-red-400">
                                                ${sumSpends.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Net */}
                                        <div className="flex justify-between mt-2 pt-2 border-t border-neutral-300/50 dark:border-neutral-700/50">
                                            <span className="font-medium">Net:</span>
                                            <span className={`font-bold ${sumDeposits - sumSpends >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                ${(sumDeposits - sumSpends).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CURRENT SHIFTS BY PROJECT */}
                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-6 bg-white/50 dark:bg-neutral-900/50">
                    <h2 className="text-xl font-semibold mb-6">Who is on Shift</h2>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map(project => {
                            const sh = shiftsByProject[project.id] ?? [];

                            return (
                                <div
                                    key={project.id}
                                    className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border p-4 bg-white/40 dark:bg-neutral-900/40"
                                >
                                    <div className="text-lg font-bold mb-4">{project.name}</div>

                                    {sh.length === 0 && (
                                        <div className="text-neutral-500 text-sm italic">
                                            Nobody on shift
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {sh.map(shift => (
                                            <div
                                                key={shift.id}
                                                className="flex flex-col rounded-lg p-3 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700/60"
                                            >
                                                <div className="font-medium">
                                                    {shift.user ? shift.user.name : 'Unknown User'}
                                                </div>

                                                <div className="text-xs text-neutral-600 dark:text-neutral-400">
                                                    {shift.start_time ?? '??'}
                                                    {" — "}
                                                    {shift.end_time ?? '??'}
                                                </div>

                                                <div className="mt-1 inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                                    {shift.type === 'first_deposit' && "FD"}
                                                    {shift.type === 'recurring_deposit' && "RD"}
                                                    {shift.type === 'all_shifts' && "ALL"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>


                <div className="relative min-h-[30vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
