import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

type User = { id: number; name: string };
type Project = { id: number; name: string };

const DepositTypeSettings = {
    first_deposit: { label: "FD", classes: "!bg-yellow-400" },
    recurring_deposit: { label: "RD", classes: "!bg-red-400" },
} as const;

const DepositStatusSettings = {
    PENDING: { label: "Pending", classes: "" },
    PAID: { label: "Paid", classes: "!bg-green-100" },
    FAILED: { label: "Failed", classes: "!bg-red-100" },
} as const;

enum DepositType {
    FD = 'first_deposit',
    RD = 'recurring_deposit',
}

enum DepositStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
}

type Deposit = {
    id: number;
    date: string;
    time: string;
    amount: string;
    status: DepositStatus;
    user_id: number;
    project_id: number;
    commission_id: number;
    commission: Commission;
    type: DepositType;
    user: User | null;
    project: Project | null;
};

type Commission = {
    id: number;
    name: string;
    order: number;
}

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    amountMin?: string;
    amountMax?: string;
    user_id?: string;
    project_id?: string;
    commission_id?: string;
    type?: DepositType;
    status?: DepositStatus;
};

type Props = {
    deposits: Deposit[];
    users: User[];
    projects: Project[];
    filters: Filters;
    commissions: Commission[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Deposits', href: '/deposits' },
];

export default function DepositsIndex({ deposits, users, projects, filters, commissions }: Props) {
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
        amountMin: filters.amountMin || "",
        amountMax: filters.amountMax || "",
        user_id: filters.user_id || "",
        project_id: filters.project_id || "",
        commission_id: filters.commission_id || "",
        type: filters.type || "",
        status: filters.status || "",
    });

    const applyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(filterState).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        router.visit(`/deposits?${params.toString()}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const updateFilter = (key: string, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    };

    const [rows, setRows] = useState(() =>
        deposits.map(d => ({
            ...d,
            time: d.time?.slice(0, 5) ?? "",
            user_id: d.user?.id ?? "",
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

        if (response.ok) {
            toast.success('Deposit updated successfully');
        }
        else {
            toast.error(data.message);
        }
    };

    const triggerSave = (row: any) => {
        clearTimeout(timers.current[row.id]);
        timers.current[row.id] = setTimeout(() => saveRow(row), 600);
    };

    const handleChange = (rowId: number, field: string, value: any) => {
        const updatedRows = rows.map(r =>
            r.id === rowId ? { ...r, [field]: value } : r
        );
        setRows(updatedRows);

        const changedRow = updatedRows.find(r => r.id === rowId);
        triggerSave(changedRow!);
    };

    const [form, setForm] = useState({
        date: '',
        time: '',
        amount: '',
        status: '',
        type: '',
        user_id: '',
        commission_id: '',
        project_id: '',
    });

    const saveNewDeposit = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...form,
            time: form.time ? form.time + ":00" : null,
        };

        const response = await fetch('/api/deposits', {
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
                    ...data.deposit,
                    time: data.deposit.time?.slice(0, 5) ?? "",
                    user_id: data.deposit.user_id,
                    project_id: data.deposit.project_id,
                },
                ...rows
            ];
            setRows(newRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setForm({
                date: '',
                time: '',
                amount: '',
                status: '',
                type: '',
                commission_id: '',
                user_id: '',
                project_id: '',
            });
            toast.success('Deposit created successfully');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Deposits" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <DollarSign className="w-6 h-6" />
                                Deposits
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

                                {/* AMOUNT MIN */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Amount Min</label>
                                    <input
                                        type="date"
                                        value={filterState.amountMin || ""}
                                        onChange={e => updateFilter("amountMin", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    />
                                </div>

                                {/* AMOUNT MAX */}
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Amount Max</label>
                                    <input
                                        type="date"
                                        value={filterState.amountMax || ""}
                                        onChange={e => updateFilter("amountMax", e.target.value)}
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
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="FAILED">Failed</option>
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
                                    onClick={() => router.visit('/deposits')}
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
                                    <th className="px-3 py-2 text-left">Time</th>
                                    <th className="px-3 py-2 text-left">Amount</th>
                                    <th className="px-3 py-2 text-left">Commission</th>
                                    <th className="px-3 py-2 text-left">Type</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                    <th className="px-3 py-2 text-left">User</th>
                                    <th className="px-3 py-2 text-left">Project</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* EXISTING ROWS */}
                                {rows.map(row => (
                                    <tr 
                                    key={row.id} 
                                    className={"border-t border-neutral-300 dark:border-neutral-800 " + DepositStatusSettings[row.status]?.classes}>
                                        {/* DATE */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="date"
                                                value={row.date ? new Date(row.date).toISOString().split("T")[0] : ""}
                                                onChange={e => handleChange(row.id, "date", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* TIME */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="time"
                                                value={row.time}
                                                onChange={e => handleChange(row.id, "time", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* AMOUNT */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={row.amount}
                                                onChange={e => handleChange(row.id, "amount", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* COMMISSION */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.commission_id}
                                                onChange={e => handleChange(row.id, "commission_id", e.target.value)}
                                                className={"w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 "}
                                            >
                                                <option value="">-</option>
                                                {commissions.map(commission => (
                                                    <option key={commission.id} value={commission.id}>{commission.order} - {commission.name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.type}
                                                onChange={e => handleChange(row.id, "type", e.target.value)}
                                                className={"w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 " + DepositTypeSettings[row.type]?.classes}
                                            >
                                                {Object.entries(DepositTypeSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.status}
                                                onChange={e => handleChange(row.id, "status", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                {Object.entries(DepositStatusSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
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

                                {/* NEW DEPOSIT ROW */}
                                <tr className="border-t border-neutral-700 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40">
                                
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
                                            type="time"
                                            value={form.time}
                                            onChange={e => setForm({ ...form, time: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    {/* COMMISSION */}
                                    <td className="px-3 py-2">
                                        <select
                                            value={form.commission_id}
                                            onChange={e => setForm({ ...form, commission_id: e.target.value })}
                                            className={"w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1 "}
                                        >
                                            <option value="">-</option>
                                            {commissions.map(commission => (
                                                <option key={commission.id} value={commission.id}>{commission.order} - {commission.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* TYPE */}
                                    <td className="px-3 py-2">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            {Object.entries(DepositTypeSettings).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* STATUS */}
                                    <td className="px-3 py-2">
                                        <select
                                            value={form.status}
                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            {Object.entries(DepositStatusSettings).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* USER */}
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

                                    {/* PROJECT */}
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
                                ↑ Go to top
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
