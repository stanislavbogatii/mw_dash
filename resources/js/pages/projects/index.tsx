import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Users } from 'lucide-react';

type Project = { id: number; name: string; currency_code: string };

type Filters = {
    search?: string;
};

type Props = {
    projects: Project[];
    filters?: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Projects', href: '/projects' },
];

export default function ProjectsIndex({ projects, filters }: Props) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const [filterState, setFilterState] = useState({
        search: filters?.search || '',
    });

    const ghostButtonClasses =
        "border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
    const primaryButtonClasses =
        "border border-primary bg-primary/90 px-3 py-1 text-xs text-white hover:bg-primary dark:border-primary dark:text-neutral-900";
    const filterFieldClasses =
        "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

    const filteredProjects = useMemo(() => {
        if (!filterState.search) return projects;
        const search = filterState.search.toLowerCase();
        return projects.filter(project =>
            project.name.toLowerCase().includes(search) ||
            project.currency_code?.toLowerCase().includes(search)
        );
    }, [projects, filterState.search]);

    const stats = useMemo(() => {
        const uniqueCurrencies = new Set(filteredProjects.map(p => p.currency_code || '—'));
        return {
            total: filteredProjects.length,
            currencies: uniqueCurrencies.size,
        };
    }, [filteredProjects]);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filterState.search) params.set('search', filterState.search);
        router.visit(`/projects?${params.toString()}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Projects" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <Users className="h-5 w-5" />
                                Projects
                            </h1>
                            <Link
                                className="border border-primary bg-primary px-3 py-1 text-xs text-white hover:opacity-90 dark:text-neutral-900"
                                href="/projects/create"
                            >
                                + Create Project
                            </Link>
                            <button
                                onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                                className={`ml-auto ${ghostButtonClasses}`}
                            >
                                ↓ Go to bottom
                            </button>
                        </div>

                        <div className="mb-2 space-y-2 border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filters</h2>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Name or Currency</label>
                                    <input
                                        type="text"
                                        value={filterState.search}
                                        onChange={e => setFilterState({ ...filterState, search: e.target.value })}
                                        className={filterFieldClasses}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1 text-xs">
                                <button onClick={applyFilters} className={primaryButtonClasses}>
                                    Apply
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterState({ search: '' });
                                        router.visit('/projects');
                                    }}
                                    className={ghostButtonClasses}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="border border-neutral-200 bg-white p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Statistics</h2>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="font-semibold">Projects: {stats.total}</p>
                                </div>
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="font-semibold">Currencies: {stats.currencies}</p>
                                </div>
                            </div>
                        </div>

                        <table className="w-full border border-neutral-200 border-collapse text-[11px] dark:border-neutral-800">
                            <thead>
                                <tr className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Name</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Currency Code</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map(project => (
                                    <tr key={project.id}>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <span className="block px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100">{project.name}</span>
                                        </td>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <span className="block px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100">
                                                {project.currency_code || '-'}
                                            </span>
                                        </td>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <Link
                                                href={`/projects/${project.id}/edit`}
                                                className="flex h-full w-full items-center justify-center bg-primary/80 px-2 py-1 text-[10px] uppercase tracking-wide text-white hover:bg-primary dark:text-neutral-900"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex w-full pt-2" ref={bottomRef}>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className={`ml-auto ${ghostButtonClasses}`}
                            >
                                ↑ Go to top
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
