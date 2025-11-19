import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

enum FineType {
    FD = 'FD',
    RD = 'RD',
    BUYING = 'BUYING',
    OTHER = 'OTHER',
}

const FineTypeSettings = {
    FD: { label: "FD", classes: "!bg-yellow-400" },
    RD: { label: "RD", classes: "!bg-red-400" },
    BUYING: { label: "BUYING", classes: "!bg-blue-400" },
    OTHER: { label: "OTHER", classes: "!bg-gray-400" },
} as const;


type Project = { id: number; name: string };

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    user_id?: string;
    type?: FineType;
    project_id?: string;
};

type Fine = {
    id: number;
    date: Date;
    amount: number;
    project_id: number;
    user_id: number;
    type: FineType;
    user: User;
    project: Project;
}

type User = {
    id: number;
    name: string;
}

type Props = {
    projects: Project[];
    filters: Filters;
    fines: Fine[];
    users: User[]
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Fines', href: '/fines' },
];

export default function FineIndex({ fines, projects, users, filters }: Props) {
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

    const [filterState, setFilterState] = useState({
        dateStart: filters.dateStart || new Date().toISOString().slice(0, 10),
        dateEnd: filters.dateEnd || "",
        user_id: filters.user_id || "",
        type: filters.type || "",
        project_id: filters.project_id || "",

    });

    const updateFilter = (key: string, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(filterState).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        router.visit(`/fines?${params.toString()}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };


    const [rows, setRows] = useState(() => 
        fines.map(s => ({
            ...s,
            date: new Date(s.date),
            id: s.id,
            user_id: s.user_id,
            type: s.type,
            user: s.user,
            amount: s.amount,
            project_id: s.project_id,
            project: s.project
        }))
    );


    const saveRow = async (row: Fine) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch(`/api/fines/${row.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json', 
            },
            body: JSON.stringify(row)
        });

        const data = await response.json();

        if (response.ok) {
            toast.success('Fine updated successfully');
        }
        else {
            toast.error(data.message);
        }
    };

    const timers: Record<number, any> = {};

    const triggerSave = (row: any) => {
        clearTimeout(timers[row.id]);
        timers[row.id] = setTimeout(() => saveRow(row), 600); 
    };

    const handleChange = (rowId: number, field: string, value: any) => {
        const updatedRows = rows.map(r =>
            r.id === rowId ? { ...r, [field]: value } : r
        );
        setRows(updatedRows);

        const changedRow = updatedRows.find(r => r.id === rowId);
        triggerSave(changedRow!);
    };

    // new fine form
    const [form, setForm] = useState({
        date: '',
        user_id: '',
        type: '',
        amount: 0,
        project_id: ''
    });

    const saveNewFine = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch('/api/fines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json', 
            },
            body: JSON.stringify(form)
        });

        const data = await response.json();

        if (response.ok) {

            const newRows = [
                {
                    ...data.fine,
                    date: data.fine.date,
                    user_id: data.fine.user_id,
                    type: data.fine.type,
                    amount: data.fine.amount,
                    project_id: data.fine.project_id,
                },
                ...rows
            ]

            setRows(newRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

            setForm({
                date: '',
                user_id: '',
                type: '',
                amount: 0,
                project_id: ''
            });
            toast.success('Fine created successfully');
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Fines" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                Fines
                            </h1>
                            
                            <button 
                                onClick={scrollToBottom}
                                className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 text-sm"
                            >
                                ↓ Go to bottom
                            </button>

                        </div>
                        {/* FILTERS PANEL */}
                        <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800 mb-6 space-y-4">

                            <h2 className="font-semibold text-lg">Filters</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                                {/* DATE START */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Date Start</label>
                                    <input
                                        type="date"
                                        value={filterState.dateStart || ""}
                                        onChange={e => updateFilter("dateStart", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    />
                                </div>

                                {/* DATE END */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Date End</label>
                                    <input
                                        type="date"
                                        value={filterState.dateEnd || ""}
                                        onChange={e => updateFilter("dateEnd", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    />
                                </div>

                                {/* USER */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">User</label>
                                    <select
                                        value={filterState.user_id || ""}
                                        onChange={e => updateFilter("user_id", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* PROJECT */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Project</label>
                                    <select
                                        value={filterState.project_id || ""}
                                        onChange={e => updateFilter("project_id", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* TYPE */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={filterState.type || ""}
                                        onChange={e => updateFilter("type", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        <option value="FD">FD</option>
                                        <option value="RD">RD</option>
                                        <option value="BUYING">BUYING</option>
                                        <option value="OTHER">OTHER</option>
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

                                <button
                                    onClick={() => router.visit('/fines')}
                                    className="px-4 py-2 bg-neutral-300 dark:bg-neutral-700 rounded hover:opacity-70"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-neutral-100 dark:bg-neutral-800">
                                    <th className="px-3 py-2 text-left">Date</th>
                                    <th className="px-3 py-2 text-left">Amount</th>
                                    <th className="px-3 py-2 text-left">Type</th>
                                    <th className="px-3 py-2 text-left">User</th>
                                    <th className="px-3 py-2 text-left">Project</th>
                                    <th className="px-3 py-2 text-right"></th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* EXISTING SHIFTS (editable) */}
                                {rows.map(row => (
                                    <tr key={row.id} className="border-t border-neutral-300 dark:border-neutral-800">

                                        {/* DATE */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="date"
                                                value={new Date(row.date).toISOString().split('T')[0]}
                                                onChange={e => handleChange(row.id, "date", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* AMOUNT */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={+row.amount}
                                                onChange={e => handleChange(row.id, "amount", +e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.type}
                                                onChange={e => handleChange(row.id, "type", e.target.value)}
                                                className={"w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"}
                                            >
                                                {Object.entries(FineTypeSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* Name */}
                                        {/* <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={row.name}
                                                onChange={e => handleChange(row.id, "name", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td> */}

                                        {/* USER */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.user_id}
                                                onChange={e => handleChange(row.id, "user_id", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                {users.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* PROJECT */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.project_id}
                                                onChange={e => handleChange(row.id, "project_id", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td></td>
                                    </tr>
                                ))}

                                {/* NEW EMPTY ROW */}
                                <tr className="border-t border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                                    <td className="px-3 py-2">
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: +e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            {Object.entries(FineTypeSettings).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>



                                    {/* <td className="px-3 py-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td> */}

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.user_id}
                                            onChange={e => setForm({ ...form, user_id: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            {users.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={saveNewFine}
                                            className="px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                        <div className="w-full flex" ref={bottomRef}>
                            <button 
                                onClick={scrollToTop}
                                className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 text-sm"
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
