// dashboard/components/ProjectMetrics.tsx

import Project from "@/models/Project";
import ProjectCard from "./ProjectCard";
import Deposit from "@/models/Deposit";
import Spend from "@/models/Spend";
import Shift from "@/models/Shift";

type Props = {
    projects: Project[];
    depositsByProject: Record<number, Deposit[]>;
    spendsByProject: Record<number, Spend[]>;
    shiftsByProject: Record<number, Shift[]>;
    label: string;
};

export default function ProjectMetrics({ projects, depositsByProject, spendsByProject, shiftsByProject, label }: Props) {
    return (
        <div className="rounded-xl border p-6 bg-white/50 dark:bg-neutral-900/50">
            <h2 className="text-xl font-semibold mb-6">{label}</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        deposits={depositsByProject[project.id]}
                        spends={spendsByProject[project.id]}
                        shifts={shiftsByProject[project.id]}
                    />
                ))}
            </div>
        </div>
    );
}
