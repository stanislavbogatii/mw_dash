import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import projects from '@/routes/projects';

type Project = { id: number; name: string };
type Commission = { id: number; name: string; order: number; project_id: number };

const DepositTypeSettings = {
    first_deposit: { label: "FD", classes: "!bg-yellow-400" },
    recurring_deposit: { label: "RD", classes: "!bg-red-400" },
} as const;

const DepositStatusSettings = {
    PENDING: { label: "Pending", classes: "" },
    PAID: { label: "Paid", classes: "!bg-green-100" },
    FAILED: { label: "Failed", classes: "!bg-red-100" },
} as const;

type DepositType = 'first_deposit' | 'recurring_deposit';
type DepositStatus = 'PENDING' | 'PAID' | 'FAILED';

type Deposit = {
    id: number;
    date: string;
    time: string;
    amount: string;
    status: DepositStatus;
    project_id: number;
    commission_id: number;
    commission: Commission;
    type: DepositType;
    project: Project | null;
};

type Props = {
    deposits: Deposit[];
    projects: Project[];
    commissions: Commission[];
    projectsByDate: Record<string, number[]>; 
    filters: any;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Sales', href: '/my-sales' },
];

export default function MySalesIndex({ deposits, commissions, projectsByDate, projects, filters }: Props) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
    console.log(projectsByDate);
    const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const [filterState, setFilterState] = useState({
        dateStart: filters.dateStart || new Date().toISOString().slice(0, 10),
        dateEnd: filters.dateEnd || "",
        amountMin: filters.amountMin || "",
        amountMax: filters.amountMax || "",
        project_id: filters.project_id || "",
        commission_id: filters.commission_id || "",
        type: filters.type || "",
        status: filters.status || "",
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filterState).forEach(([k, v]) => v && params.set(k, v));
        router.visit(`/my-sales?${params.toString()}`, { preserveScroll: true });
    };

    const updateFilter = (key: string, value: any) =>
        setFilterState(prev => ({ ...prev, [key]: value }));

    const [rows, setRows] = useState(() =>
        deposits.map(d => ({
            ...d,
            time: d.time?.slice(0, 5) ?? "",
            project_id: d.project?.id ?? "",
        }))
    );

    const timers = useRef<Record<number, any>>({});

    const saveRow = async (row: Deposit) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...row,
            time: row.time ? row.time + ":00" : null,
        };

        const response = await fetch(`/api/deposits/${row.id}`, {
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
        time: '',
        amount: '',
        status: '',
        type: '',
        commission_id: '',
        project_id: '',
    });

    const availableProjects = form.date ? projectsByDate[form.date] || [] : [];
    const saveNewDeposit = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = { ...form, time: form.time ? form.time + ":00" : null };

        const response = await fetch('/api/my-sales', {
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
                ...data.deposit,
                time: data.deposit.time?.slice(0, 5) ?? "",
                project_id: data.deposit.project_id,
            };

            setRows([newRow, ...rows]);
            setForm({ date: '', time: '', amount: '', status: '', type: '', commission_id: '', project_id: '' });
            toast.success("Created");
        } else {
            toast.error(data.message);
        }
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Sales" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                My Sales
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

                                {/* Status */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Status</label>
                                    <select
                                        value={filterState.status}
                                        onChange={e => updateFilter("status", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="FAILED">Failed</option>
                                    </select>
                                </div>

                                {/* Type */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={filterState.type}
                                        onChange={e => updateFilter("type", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        <option value="first_deposit">FD</option>
                                        <option value="recurring_deposit">RD</option>
                                    </select>
                                </div>

                                {/* Commission */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Commission</label>
                                    <select
                                        value={filterState.commission_id}
                                        onChange={e => updateFilter("commission_id", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    >
                                        <option value="">All</option>
                                        {commissions.map(c => (
                                            <option key={c.id} value={c.id}>{c.order} - {c.name}</option>
                                        ))}
                                    </select>
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
                                    onClick={() => router.visit('/my-sales')}
                                    className="px-4 py-2 bg-neutral-300 dark:bg-neutral-700 rounded hover:opacity-70"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        {/* STATISTICS */}
                        <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800">

                            <h2 className="font-semibold text-lg">Statistics</h2>

                            <div className=" gap-4">

                                <div className="flex flex-col w-full">
                                    <span className="text-sm font-semibold w-full">TOTAL: 
                                        &nbsp;{rows.length} (${rows.reduce((a, d) => a + +d.amount, 0)})&nbsp;&nbsp;&nbsp;

                                        <span className="text-sm font-normal text-green-500 dark:text-green-400">
                                            {rows.filter(d => d.status === "PAID").length} (${rows.filter(d => d.status === "PAID").reduce((a, d) => a + +d.amount, 0)})/
                                        </span>
                                        <span className="text-sm font-normal text-yellow-500 dark:text-yellow-400">
                                            {rows.filter(d => d.status === "PENDING").length} (${rows.filter(d => d.status === "PENDING").reduce((a, d) => a + +d.amount, 0)})/
                                        </span>
                                        <span className="text-sm font-normal text-red-500 dark:text-red-400">
                                            {rows.filter(d => d.status === "FAILED").length} (${rows.filter(d => d.status === "FAILED").reduce((a, d) => a + +d.amount, 0)})
                                        </span>
                                    </span>
                                    <span className="text-sm font-semibold">FD: 
                                        &nbsp;{rows.filter(d => d.type === "first_deposit").length} (${rows.filter(d => d.type === "first_deposit").reduce((a, d) => a + +d.amount, 0)})&nbsp;&nbsp;&nbsp;
                                        <span className="text-sm font-normal text-green-500 dark:text-green-400">
                                            {rows.filter(d => d.type === "first_deposit" && d.status === "PAID").length} (${rows.filter(d => d.type === "first_deposit" && d.status === "PAID").reduce((a, d) => a + +d.amount, 0)})/
                                        </span>
                                        <span className="text-sm font-normal text-yellow-500 dark:text-yellow-400">
                                            {rows.filter(d => d.type === "first_deposit" && d.status === "PENDING").length} (${rows.filter(d => d.type === "first_deposit" && d.status === "PENDING").reduce((a, d) => a + +d.amount, 0)})/
                                        </span>
                                        <span className="text-sm font-normal text-red-500 dark:text-red-400">
                                            {rows.filter(d => d.type === "first_deposit" && d.status === "FAILED").length} (${rows.filter(d => d.type === "first_deposit" && d.status === "FAILED").reduce((a, d) => a + +d.amount, 0)})
                                        </span>
                                    </span>

                                    <span className="text-sm font-semibold">RD: 
                                        &nbsp;{rows.filter(d => d.type === "recurring_deposit").length} (${rows.filter(d => d.type === "recurring_deposit").reduce((a, d) => a + +d.amount, 0)})&nbsp;&nbsp;&nbsp;
                                        <span className="text-sm font-normal text-green-500 dark:text-green-400">
                                            {rows.filter(d => d.type === "recurring_deposit" && d.status === "PAID").length} (${rows.filter(d => d.type === "recurring_deposit" && d.status === "PAID").reduce((a, d) => a + +d.amount, 0)})/
                                        </span>
                                        <span className="text-sm font-normal text-yellow-500 dark:text-yellow-400">
                                            {rows.filter(d => d.type === "recurring_deposit" && d.status === "PENDING").length} (${rows.filter(d => d.type === "recurring_deposit" && d.status === "PENDING").reduce((a, d) => a + +d.amount, 0)})/
                                        </span> 
                                        <span className="text-sm font-normal text-red-500 dark:text-red-400">
                                            {rows.filter(d => d.type === "recurring_deposit" && d.status === "FAILED").length}  (${rows.filter(d => d.type === "recurring_deposit" && d.status === "FAILED").reduce((a, d) => a + +d.amount, 0)})
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* TABLE */}
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-neutral-100 dark:bg-neutral-800">
                                    <th className="px-3 py-2 text-left">Date</th>
                                    <th className="px-3 py-2 text-left">Time</th>
                                    <th className="px-3 py-2 text-left">Amount</th>
                                    <th className="px-3 py-2 text-left">Commission</th>
                                    <th className="px-3 py-2 text-left">Type</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                    <th className="px-3 py-2 text-left">Project</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* EXISTING */}
                                {rows.map(row => (
                                    <tr key={row.id}
                                        className={"border-t border-neutral-300 dark:border-neutral-800 " +
                                            DepositStatusSettings[row.status]?.classes}>

                                        <td className="px-3 py-2">
                                            <input type="date"
                                                value={row.date ? new Date(row.date).toISOString().split("T")[0] : ""}
                                                onChange={e => handleChange(row.id, "date", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <input type="time"
                                                value={row.time}
                                                onChange={e => handleChange(row.id, "time", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <input type="number" step="0.01"
                                                value={row.amount}
                                                onChange={e => handleChange(row.id, "amount", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1" />
                                        </td>

                                        <td className="px-3 py-2">
                                            <select
                                                value={row.commission_id}
                                                onChange={e => handleChange(row.id, "commission_id", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                {commissions.filter((c) => c.project_id === row.project_id).map(c => (
                                                    <option key={c.id} value={c.id}>{c.order} - {c.name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-3 py-2">
                                            <select
                                                value={row.type}
                                                onChange={e => handleChange(row.id, "type", e.target.value)}
                                                className={"w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1 " +
                                                    DepositTypeSettings[row.type]?.classes}
                                            >
                                                {Object.entries(DepositTypeSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-3 py-2">
                                            <select
                                                value={row.status}
                                                onChange={e => handleChange(row.id, "status", e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                {Object.entries(DepositStatusSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="px-3 py-2">
                                            <select
                                                value={row.project_id}
                                                onChange={e => handleChange(row.id, "project_id", +e.target.value)}
                                                className="w-full rounded border bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                {(projectsByDate[row.date ? new Date(row.date).toISOString().split("T")[0] : ""] || []).map(pid => (
                                                    <option key={pid} value={pid}>
                                                        {projects.find(p => p.id === pid)?.name || "-"}
                                                    </option>
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
                                            type="time"
                                            value={form.time}
                                            onChange={e => setForm({ ...form, time: e.target.value })}
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
                                        <select
                                            value={form.commission_id}
                                            onChange={e => setForm({ ...form, commission_id: e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        >
                                            <option value="">-</option>
                                            {commissions.filter((c) => c.project_id === form.project_id).map(c => (
                                                <option key={c.id} value={c.id}>{c.order} - {c.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        >
                                            <option value="">-</option>
                                            <option value="first_deposit">FD</option>
                                            <option value="recurring_deposit">RD</option>
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.status}
                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                        >
                                            <option value="">-</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="PAID">Paid</option>
                                            <option value="FAILED">Failed</option>
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: +e.target.value })}
                                            className="w-full rounded border px-2 py-1 bg-white dark:bg-neutral-900"
                                            disabled={!form.date}
                                        >
                                            <option value="">-</option>
                                            {availableProjects.map(pid => (
                                                <option key={pid} value={pid}>
                                                    {projects.find(p => p.id === pid)?.name || "-"}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={saveNewDeposit}
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
