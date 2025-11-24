// dashboard/components/TodayShifts.tsx

import ShiftCard from "./ShiftCard";

type Props = {
    projects: any[];
    shiftsByProject: Record<number, any[]>;
    label: string
};

export default function TodayShifts({ projects, shiftsByProject, label }: Props) {
    return (
        <div className="rounded-xl border p-6 bg-white/50 dark:bg-neutral-900/50">
            <h2 className="text-xl font-semibold mb-6">{label}</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => {
                    const sh = shiftsByProject[project.id] ?? [];

                    return (
                        <div key={project.id} className="rounded-xl border p-4 bg-white/40 dark:bg-neutral-900/40">
                            <div className="text-lg font-bold mb-4">{project.name}</div>

                            {sh.length === 0 && (
                                <div className="text-neutral-500 text-sm italic">Nobody on shift</div>
                            )}

                            <div className="space-y-3">
                                {sh.map(shift => (
                                    <ShiftCard key={shift.id} shift={shift} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
