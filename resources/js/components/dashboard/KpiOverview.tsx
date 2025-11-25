// dashboard/components/KpiOverview.tsx

type Props = {
    projects: any[];
    kpiByProject: Record<number, any[]>;
};

export default function KpiOverview({ projects, kpiByProject }: Props) {
    return (
        <div className="rounded-xl border p-6 bg-white/50 dark:bg-neutral-900/50">
            <h2 className="text-xl font-semibold mb-6">KPI Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => {
                    const item = kpiByProject[project.id]?.[0];

                    if (!item) {
                        return (
                            <div key={project.id} className="rounded-xl border p-4 bg-white/40 dark:bg-neutral-900/40">
                                <div className="text-lg font-bold mb-2">{project.name}</div>
                                <div className="text-neutral-500 text-sm italic">No KPI data</div>
                            </div>
                        );
                    }

                    return (
                        <div key={project.id} className="rounded-xl border p-4 bg-white/40 dark:bg-neutral-900/40">
                            <div className="text-lg font-bold mb-4">{project.name}</div>

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-medium">Total Income:</span>
                                    <span className="font-semibold text-green-600">${item.total_income.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="font-medium">FD Income:</span>
                                    <span className="font-semibold text-green-600">${item.fd_income.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="font-medium">RD Income:</span>
                                    <span className="font-semibold text-green-600">${item.rd_income.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="font-medium">Total Spend:</span>
                                    <span className="font-semibold text-red-600">${item.total_spend.toFixed(2)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="font-medium">Subscribers:</span>
                                    <span>
                                        {item.total_subscribers} (
                                        {item.total_subscribers
                                            ? (item.total_spend / item.total_subscribers).toFixed(2)
                                            : "-"
                                        }
                                        $/sub)
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="font-medium">Dialogs:</span>
                                    <span>
                                        {item.total_dialogs} (
                                        {item.total_dialogs
                                            ? (item.total_spend / item.total_dialogs).toFixed(2)
                                            : "-"
                                        }
                                        $/dialog)
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
