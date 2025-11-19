import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

type User = { id: number; name: string };
type Project = { id: number; name: string };

enum ShiftType {
    FD = 'first_deposit',
    RD = 'recurring_deposit',
    ALL = 'all_shifts',
}

const ShiftTypeSettings = {
    first_deposit: {
        label: "FD",
        classes: "!bg-yellow-400"
    },
    recurring_deposit: { 
        label: "RD",
        classes: "!bg-red-400"
    },
    all_shifts: {
        label: "ALL",
        classes: "!bg-blue-400",
    }
} as const;

type Shift = {
    id: number;
    date: string;
    start_time: string | null;
    end_time: string | null;
    type: ShiftType;
    user: User | null;
    project: Project | null;
};

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    user_id?: string;
    project_id?: string;
    type?: string;
    status?: string;
};

type Props = {
    shifts: Shift[];
    users: User[];
    projects: Project[];
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Shifts', href: '/shifts' },
];

export default function ShiftsIndex({ shifts, users, projects, filters }: Props) {
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
        project_id: filters.project_id || "",
        type: filters.type || "",
        status: filters.status || "",
    });

    const updateFilter = (key: string, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(filterState).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        router.visit(`/shifts?${params.toString()}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };


    const [rows, setRows] = useState(() => 
        shifts.map(s => ({
            ...s,
            start_time: s.start_time?.slice(0, 5) ?? "",
            end_time: s.end_time?.slice(0, 5) ?? "",
            user_id: s.user?.id ?? "",
            project_id: s.project?.id ?? "",
            type: s.type,
        }))
    );


    const saveRow = async (row: Shift) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = {
            ...row,
            start_time: row.start_time ? row.start_time + ":00" : null,
            end_time: row.end_time ? row.end_time + ":00" : null,
        };

        const response = await fetch(`/api/shifts/${row.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json', 
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            toast.success('Shift updated successfully');
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

    // new shift form
    const [form, setForm] = useState({
        date: '',
        start_time: '',
        end_time: '',
        type: 'FD' as any,
        user_id: '',
        project_id: ''
    });

    const saveNewShift = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = {
            ...form,
            start_time: form.start_time ? form.start_time + ":00" : null,
            end_time: form.end_time ? form.end_time + ":00" : null,
            type: form.type, 
        };

        const response = await fetch('/api/shifts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json', 
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {

            const newRows = [
                {
                    ...data.shift,
                    start_time: data.shift.start_time?.slice(0, 5) ?? "",
                    end_time: data.shift.end_time?.slice(0, 5) ?? "",
                    user_id: data.shift.user_id,
                    project_id: data.shift.project_id,
                },
                ...rows
            ]

            setRows(newRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

            setForm({
                date: '',
                start_time: '',
                end_time: '',
                type: 'FD' as any,
                user_id: '',
                project_id: ''
            });
            toast.success('Shift created successfully');
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shifts" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                Shifts
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
                                        <option value="first_deposit">FD</option>
                                        <option value="recurring_deposit">RD</option>
                                        <option value="all_shifts">ALL</option>
                                    </select>
                                </div>

                                {/* STATUS */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={filterState.status || ""}
                                        onChange={e => updateFilter("status", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
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
                                    onClick={() => router.visit('/shifts')}
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
                                    <th className="px-3 py-2 text-left">Start Time - End Time</th>
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

                                        {/* TIME */}
                                        <td className={"px-3 py-2 flex flex-row gap-3"}>
                                            <input
                                                type="time"
                                                value={row.start_time}
                                                onChange={e => handleChange(row.id, "start_time", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            /> 
                                            <input
                                                type="time"
                                                value={row.end_time}
                                                onChange={e => handleChange(row.id, "end_time", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            /> 
                                        </td>

                                        {/* TYPE */}
                                        <td className={"px-3 py-2 "}>
                                            <select
                                                value={row.type}
                                                onChange={e => handleChange(row.id, "type", e.target.value)}
                                                className={"w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 " + ShiftTypeSettings[row.type].classes}
                                            >
                                                <option value="first_deposit">FD</option>
                                                <option value="recurring_deposit">RD</option>
                                                <option value="all_shifts">ALL</option>
                                            </select>
                                        </td>

                                        {/* USER */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.user_id}
                                                onChange={e => handleChange(row.id, "user_id", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name}</option>
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

                                    <td className="px-3 py-2 flex gap-2">
                                        <input
                                            type="time"
                                            value={form.start_time}
                                            onChange={e => setForm({ ...form, start_time: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                        <input
                                            type="time"
                                            value={form.end_time}
                                            onChange={e => setForm({ ...form, end_time: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value as any })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="FD">FD</option>
                                            <option value="RD">RD</option>
                                            <option value="ALL">ALL</option>
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.user_id}
                                            onChange={e => setForm({ ...form, user_id: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
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
                                            onClick={saveNewShift}
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
