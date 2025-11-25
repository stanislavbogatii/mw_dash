import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

type Project = { 
    id: number; 
    name: string;
};

type Filters = {
    project_id?: string;
};


type Commission = { 
    id: number; 
    name: string;
    order: number;
    amount: number; 
    project_id: number;
    project: Project;
};

type Props = {
    commissions: Commission[];
    filters: Filters;
    projects: Project[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Commissions', href: '/commissions' },
];

const filterFieldClasses =
    "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
const ghostButtonClasses =
    "border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
const primaryButtonClasses =
    "border border-primary bg-primary/90 px-3 py-1 text-xs text-white hover:bg-primary dark:border-primary dark:text-neutral-900";
const secondaryButtonClasses =
    "border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";

function SortableRow({ commission }: { commission: Commission }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: commission.id });


    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab"
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="bg-white dark:bg-neutral-900"
        >
            <td className="border border-neutral-200 p-0 text-[11px] text-neutral-800 dark:border-neutral-800 dark:text-neutral-100">
                <span className="block px-2 py-1">{commission.name}</span>
            </td>
            <td className="border border-neutral-200 p-0 text-[11px] text-neutral-800 dark:border-neutral-800 dark:text-neutral-100">
                <span className="block px-2 py-1">{commission.amount}</span>
            </td>
            <td className="border border-neutral-200 p-0 text-[11px] text-neutral-800 dark:border-neutral-800 dark:text-neutral-100">
                <span className="block px-2 py-1">{commission.project.name}</span>
            </td>

            <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                <Link
                    href={`/commissions/${commission.id}/edit`}
                    className="flex h-full w-full items-center justify-center bg-primary/80 px-2 py-1 text-[10px] uppercase tracking-wide text-white hover:bg-primary dark:text-neutral-900"
                >
                    Edit
                </Link>
            </td>
        </tr>
    );
}


export default function CommissionIndex({ commissions, filters, projects }: Props) {
    const [items, setItems] = useState(
        [...commissions].sort((a, b) => a.order - b.order)
    );
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(filterState).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        router.visit(`/commissions?${params.toString()}`, {
            preserveScroll: false,
            preserveState: false,
        });
    };

    const updateFilter = (key: string, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    };

    const [filterState, setFilterState] = useState({
        project_id: filters.project_id || "",
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    async function handleDragEnd(event: any) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        setItems(newItems);

        const response = await fetch(`/api/commissions/reorder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json', 
            },
            body: JSON.stringify({
                order: newItems.map((item, index) => ({
                    id: item.id,
                    order: index + 1
                }))
            })
        })

        if (response.ok) {
            toast.success('Commissions reordered successfully');
        }
        else {
            toast.error('Something went wrong');
        }

    }

    const stats = useMemo(() => {
        const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const uniqueProjects = new Set(items.map(i => i.project_id));
        return {
            total: items.length,
            amount: totalAmount,
            projects: uniqueProjects.size,
        };
    }, [items]);

    const formatCurrency = (value: number) => value.toLocaleString(undefined, { maximumFractionDigits: 2 });


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Commissions" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className='flex items-center gap-2'>
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <BookOpen className="h-5 w-5" />
                                Commissions
                            </h1>

                            <Link
                                className="border border-primary bg-primary px-3 py-1 text-xs text-white hover:opacity-90 dark:text-neutral-900"
                                href="/commissions/create"
                            >
                                + Create Commission
                            </Link>

                            <button
                                onClick={scrollToBottom}
                                className={`ml-auto ${ghostButtonClasses}`}
                            >
                                ↓ Go to bottom
                            </button>
                        </div>
                        <div className="mb-2 space-y-2 border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">

                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filters</h2>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

                                {/* PROJECT */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Project</label>
                                    <select
                                        value={filterState.project_id || ""}
                                        onChange={e => updateFilter("project_id", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* BUTTONS */}
                            <div className="flex gap-2 pt-1 text-xs">
                                <button
                                    onClick={applyFilters}
                                    className={primaryButtonClasses}
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={() => router.visit('/commissions')}
                                    className={secondaryButtonClasses}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* <div className="border border-neutral-200 bg-white p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Statistics</h2>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="font-semibold">Items: {stats.total}</p>
                                    <p className="font-semibold">Amount: ${formatCurrency(stats.amount)}</p>
                                </div>
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="font-semibold">Projects: {stats.projects}</p>
                                </div>
                            </div>
                        </div> */}

                        {/* === Drag & Drop Table === */}
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={items.map(i => i.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <table className="w-full border border-neutral-200 border-collapse text-[11px] dark:border-neutral-800">
                                    <thead>
                                        <tr className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                            <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Name</th>
                                            <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Amount</th>
                                            <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Project</th>
                                            <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Edit</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {items.map(commission => (
                                            <SortableRow
                                                key={commission.id}
                                                commission={commission}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </SortableContext>
                        </DndContext>

                        <div className="flex w-full pt-2" ref={bottomRef}>
                            <button
                                onClick={scrollToTop}
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
