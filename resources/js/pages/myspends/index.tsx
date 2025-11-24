import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

type Project = { id: number; name: string };

type Spend = {
    id: number;
    date: string;
    subscribers: number;
    dialogs: number;
    amount: string;
    project_id: number;
};

type Props = {
    spends: Spend[];
    projects: Project[];
    filters: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Spends', href: '/my-spends' },
];

export default function MySpendsIndex({ spends, projects, filters }: Props) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const [filterState, setFilterState] = useState({
        dateStart: filters.dateStart || new Date().toISOString().slice(0, 10),
        dateEnd: filters.dateEnd || "",
        amountMin: filters.amountMin || "",
        amountMax: filters.amountMax || "",
        project_id: filters.project_id || "",
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filterState).forEach(([k, v]) => v && params.set(k, v));
        router.visit(`/my-spends?${params.toString()}`, { preserveScroll: true });
    };

    const updateFilter = (key: string, value: any) =>
        setFilterState(prev => ({ ...prev, [key]: value }));

    const [rows, setRows] = useState(() =>
        spends.map(d => ({
            ...d,
            project_id: d.project_id ?? "",
        }))
    );

    const timers = useRef<Record<number, any>>({});

    const saveRow = async (row: Spend) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...row,
            // date: new Date(row.date).toISOString().slice(0, 10),
        };

        const response = await fetch(`/api/my-spends/${row.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrf,
                'Accept': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        response.ok ? toast.success('Saved') : toast.error(data.message);
    };

    const triggerSave = (row: any) => {
        clearTimeout(timers.current[row.id]);
        timers.current[row.id] = setTimeout(() => saveRow(row), 600);
    };

    const handleChange = (rowId: number, field: string, value: any) => {
        const updated = rows.map(r => r.id === rowId ? { ...r, [field]: value } : r);
        setRows(updated);
        const changed = updated.find(r => r.id === rowId)!;
        triggerSave(changed);
    };

    // NEW ROW
    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        dialogs: 0,
        subscribers: 0,
        amount: '',
        project_id: '',
    });

    const saveNewSpend = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = { ...form };

        const response = await fetch('/api/my-spends', {
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
            const newRow = {
                ...data.spend,
                time: data.spend.time?.slice(0, 5) ?? "",
                project_id: data.spend.project_id,
            };

            setRows([newRow, ...rows]);
            setForm({ date: '', amount: '', project_id: '', subscribers: 0, dialogs: 0 });
            toast.success("Created");
        } else {
            toast.error(data.message);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Spends" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                My Spends
                            </h1>
                            <button
                                onClick={scrollToBottom}
                                className="ml-auto px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 text-sm"
                            >
                                ↓ Bottom
                            </button>
                        </div>

                        {/* FILTERS */}
                        <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800 mb-6 space-y-4">

                            <h2 className="font-semibold text-lg">Filters</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

                                {/* Date Range */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Date Start</label>
                                    <input type="date"
                                        value={filterState.dateStart}
                                        onChange={e => updateFilter("dateStart", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900" />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Date End</label>
                                    <input type="date"
                                        value={filterState.dateEnd}
                                        onChange={e => updateFilter("dateEnd", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900" />
                                </div>


                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={applyFilters}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={() => router.visit('/my-spends')}
                                    className="px-4 py-2 bg-neutral-300 dark:bg-neutral-700 rounded hover:opacity-70"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-neutral-100 dark:bg-neutral-800">
                                    <th className="px-3 py-2 text-left">Date</th>
                                    <th className="px-3 py-2 text-left">Amount</th>
                                    <th className="px-3 py-2 text-left">Subscribers</th>
                                    <th className="px-3 py-2 text-left">Dialogs</th>
                                    <th className="px-3 py-2 text-left">Project</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* EXISTING */}
                                {rows.map(row => (
                                    <tr key={row.id}
                                        className={"border-t border-neutral-300 dark:border-neutral-800 "}>

                                        <td className="px-3 py-2">
                                            <input type="date"
                                                value={row.date ? new Date(row.date).toISOString().split("T")[0] : ""}
                                                onChange={e => handleChange(row.id, "date", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <input type="number" step="0.01"
                                                value={row.amount}
                                                onChange={e => handleChange(row.id, "amount", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <input type="number"
                                                value={row.subscribers}
                                                onChange={e => handleChange(row.id, "subscribers", +e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <input type="number"
                                                value={row.dialogs}
                                                onChange={e => handleChange(row.id, "dialogs", +e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <select
                                                value={row.project_id}
                                                onChange={e => handleChange(row.id, "project_id", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1">
                                                <option value="">-</option>
                                                {projects.map(project => (
                                                    <option key={project.id} value={project.id}>{project.name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td></td>
                                    </tr>
                                ))}

                                {/* NEW ROW */}
                                <tr className="border-t bg-neutral-50 dark:bg-neutral-800/40">
                                    <td className="px-3 py-2">
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value, project_id: "" })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <input
                                            type="number" step="0.01"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={form.subscribers}
                                            onChange={e => setForm({ ...form, subscribers: +e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={form.dialogs}
                                            onChange={e => setForm({ ...form, dialogs: +e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        >
                                            <option value="">-</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>


                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={saveNewSpend}
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
                                ↑ Top
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
