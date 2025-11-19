import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';


type Project = { id: number; name: string };

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    project_id?: string;
};

type Kpi = {
    id: number;
    date: Date;
    project_id: number;
    project: Project;
    total_spend: number;
    total_subscribers: number;
    total_dialogs: number;
    total_income: number;
    total_deposits: number;
    fd_income: number;
    rd_income: number;
    fd_deposits: number;
    rd_deposits: number;
}

type User = {
    id: number;
    name: string;
}

type Props = {
    projects: Project[];
    filters: Filters;
    kpi: Kpi[];
    users: User[]
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'KPI', href: '/kpi' },
];

export default function FineIndex({ kpi, projects, filters }: Props) {
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

        router.visit(`/kpi?${params.toString()}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };


    const [rows, setRows] = useState(() => 
        kpi.map(k => ({
            ...k,
            date: new Date(k.date),
            id: k.id,
            total_spend: k.total_spend,
            project_id: k.project_id,
            project: k.project,
            total_subscribers: k.total_subscribers,
            total_dialogs: k.total_dialogs,
            total_income: k.total_income,
            total_deposits: k.total_deposits,
            fd_income: k.fd_income,
            rd_income: k.rd_income,
            fd_deposits: k.fd_deposits,
            rd_deposits: k.rd_deposits
        }))
    );


    const saveRow = async (row: Kpi) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch(`/api/kpi/${row.id}`, {
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
            toast.success('Kpi updated successfully');
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

    // new kpi form
    const [form, setForm] = useState({
        date: '',
        project_id: '',
        total_spend: '',
        total_subscribers: '',
        total_dialogs: '',
        total_income: '',
        total_deposits: '',
        fd_income: '',
        rd_income: '',
        fd_deposits: '',
        rd_deposits: '',
    });

    const saveNewFine = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch('/api/kpi', {
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
                    ...data.kpi,
                    date: data.kpi.date,
                    project_id: data.kpi.project_id,
                    project: data.kpi.project,
                    total_spend: data.kpi.total_spend,
                    total_subscribers: data.kpi.total_subscribers,
                    total_dialogs: data.kpi.total_dialogs,
                    total_income: data.kpi.total_income,
                    total_deposits: data.kpi.total_deposits,
                    fd_income: data.kpi.fd_income,
                    rd_income: data.kpi.rd_income,
                    fd_deposits: data.kpi.fd_deposits,
                    rd_deposits: data.kpi.rd_deposits
                },
                ...rows
            ]

            setRows(newRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

            setForm({
                date: '',
                project_id: '',
                total_spend: '',
                total_subscribers: '',
                total_dialogs: '',
                total_income: '',
                total_deposits: '',
                fd_income: '',
                rd_income: '',
                fd_deposits: '',
                rd_deposits: ''
            });
            toast.success('Kpi created successfully');
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="KPI" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                KPI
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
                                    onClick={() => router.visit('/kpi')}
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
                                    <th className="px-3 py-2 text-left min-w-[150px]">Project</th>
                                    <th className="px-3 py-2 text-right">Spend</th>
                                    <th className="px-3 py-2 text-right">Subscribers</th>
                                    <th className="px-3 py-2 text-right">Dialogs</th>
                                    <th className="px-3 py-2 text-right">Income</th>
                                    <th className="px-3 py-2 text-right">Deposits</th>
                                    <th className="px-3 py-2 text-right">FD Income</th>
                                    <th className="px-3 py-2 text-right">RD Income</th>
                                    <th className="px-3 py-2 text-right">FD Deposits</th>
                                    <th className="px-3 py-2 text-right">RD Deposits</th>
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

                                        {/* SPEND */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.total_spend}
                                                onChange={e => handleChange(row.id, "spend", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* SUBSCRIBERS */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.total_subscribers}
                                                onChange={e => handleChange(row.id, "subscribers", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* DIALOGS */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.total_dialogs}
                                                onChange={e => handleChange(row.id, "dialogs", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* INCOME */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.total_income}
                                                onChange={e => handleChange(row.id, "income", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* DEPOSITS */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.total_deposits}
                                                onChange={e => handleChange(row.id, "deposits", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* FD INCOME */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.fd_income}
                                                onChange={e => handleChange(row.id, "fd_income", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* RD INCOME */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.rd_income}
                                                onChange={e => handleChange(row.id, "rd_income", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* FD DEPOSITS */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.fd_deposits}
                                                onChange={e => handleChange(row.id, "fd_deposits", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* RD DEPOSITS */}
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                value={row.rd_deposits}
                                                onChange={e => handleChange(row.id, "rd_deposits", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

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
                                        <input
                                            type="number"
                                            value={form.total_spend}
                                            onChange={e => setForm({ ...form, total_spend: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.total_subscribers}
                                            onChange={e => setForm({ ...form, total_subscribers: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.total_dialogs}
                                            onChange={e => setForm({ ...form, total_dialogs: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.total_income}
                                            onChange={e => setForm({ ...form, total_income: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.total_deposits}
                                            onChange={e => setForm({ ...form, total_deposits: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.fd_income}
                                            onChange={e => setForm({ ...form, fd_income: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.rd_income}
                                            onChange={e => setForm({ ...form, rd_income: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.fd_deposits}
                                            onChange={e => setForm({ ...form, fd_deposits: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            value={form.rd_deposits}
                                            onChange={e => setForm({ ...form, rd_deposits: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
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
