import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
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
            className="border-t border-neutral-300 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
            <td className="px-3 py-2">{commission.name}</td>
            <td className="px-3 py-2">{commission.amount}</td>
            <td className="px-3 py-2">{commission.project.name}</td>

            <td className="px-3 py-2 text-right">
                <Link
                    href={`/commissions/${commission.id}/edit`}
                    className="text-primary hover:underline"
                >
                    Edit →
                </Link>
            </td>
        </tr>
    );
}


export default function CommissionIndex({ commissions, filters, projects }: Props) {
    const [items, setItems] = useState(
        [...commissions].sort((a, b) => a.order - b.order)
    );

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


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Commissions" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className='flex'>
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                Commissions
                            </h1>

                            <div className="ml-auto">
                                <Link
                                    className="px-3 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm"
                                    href="/commissions/create"
                                >
                                    + Create Commission
                                </Link>
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800 mb-6 space-y-4">

                            <h2 className="font-semibold text-lg">Filters</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                                {/* PROJECT */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Project</label>
                                    <select
                                        value={filterState.project_id || ""}
                                        onChange={e => updateFilter("project_id", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* BUTTONS */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>

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
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-neutral-100 dark:bg-neutral-800">
                                            <th className="px-3 py-2 text-left">Name</th>
                                            <th className="px-3 py-2 text-left">Amount</th>
                                            <th className="px-3 py-2 text-left">Project</th>
                                            <th></th>
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

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
