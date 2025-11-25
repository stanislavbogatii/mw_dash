import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Check, DollarSign, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

type User = { id: number; name: string };
type Project = { id: number; name: string; currency_code: string };

const DepositTypeSettings = {
    first_deposit: { label: "FD", classes: "!bg-yellow-400" },
    recurring_deposit: { label: "RD", classes: "!bg-red-400" },
} as const;

const DepositStatusSettings = {
    PENDING: { label: "Pending", classes: "" },
    PAID: { label: "Paid", classes: "!bg-green-200 dark:!bg-green-900/60" },
    FAILED: { label: "Failed", classes: "!bg-red-200 dark:!bg-red-900/60" },
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

type EditableDeposit = Omit<Deposit, 'user_id' | 'project_id' | 'time' | 'commission_id'> & {
    time: string;
    user_id: number | '';
    project_id: number | '';
    commission_id: number | '';
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

    const [rows, setRows] = useState<EditableDeposit[]>(() =>
        deposits.map(d => ({
            ...d,
            time: d.time?.slice(0, 5) ?? "",
            user_id: d.user?.id ?? "",
            project_id: d.project?.id ?? "",
            commission_id: d.commission_id ?? "",
        }))
    );

    const [editingRowId, setEditingRowId] = useState<number | null>(null);
    const sheetInputClasses =
        "w-full border-none bg-transparent px-1 py-0.5 text-[11px] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary/40";
    const cellTextClasses =
        "block px-1 py-0.5 text-[11px] font-medium text-neutral-900 dark:text-neutral-100";
    const filterFieldClasses =
        "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

    const saveRow = async (row: EditableDeposit) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...row,
            time: row.time ? row.time + ":00" : null,
            user_id: row.user_id === '' ? null : row.user_id,
            project_id: row.project_id === '' ? null : row.project_id,
            commission_id: row.commission_id === '' ? null : row.commission_id,
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
            return true;
        }

        toast.error(data.message);
        return false;
    };

    const saveRowChanges = async (rowId: number) => {
        const currentRow = rows.find(r => r.id === rowId);
        if (!currentRow) return;

        const success = await saveRow(currentRow);
        if (success) {
            setEditingRowId(null);
        }
    };

    const findUserName = (id: number | '') => {
        if (!id) return '—';
        return users.find(u => u.id === Number(id))?.name ?? '—';
    };

    const findProjectName = (id: number | '') => {
        if (!id) return '—';
        return projects.find(p => p.id === Number(id))?.name ?? '—';
    };

    const findCommissionLabel = (id: number | '') => {
        if (!id) return '—';
        const commission = commissions.find(c => c.id === Number(id));
        return commission ? `${commission.order} - ${commission.name}` : '—';
    };

    const activateRowEditing = (rowId: number) => setEditingRowId(rowId);

    const toggleRowEditing = (rowId: number) => {
        setEditingRowId(prev => {
            if (prev === rowId) {
                return null;
            }
            return rowId;
        });
    };

    const handleChange = (rowId: number, field: keyof EditableDeposit, value: any) => {
        const updatedRows = rows.map(r =>
            r.id === rowId ? { ...r, [field]: value } : r
        );
        setRows(updatedRows);
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

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <DollarSign className="h-5 w-5" />
                                Deposits
                            </h1>
                            <button 
                                onClick={scrollToBottom}
                                className="ml-auto border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                ↓ Go to bottom
                            </button>
                        </div>
                        {/* FILTERS PANEL */}
                        <div className="mb-2 space-y-2 border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">

                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filters</h2>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">

                                {/* DATE START */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Date Start</label>
                                    <input
                                        type="date"
                                        value={filterState.dateStart || ""}
                                        onChange={e => updateFilter("dateStart", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>

                                {/* DATE END */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Date End</label>
                                    <input
                                        type="date"
                                        value={filterState.dateEnd || ""}
                                        onChange={e => updateFilter("dateEnd", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>

                                {/* AMOUNT MIN */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Amount Min</label>
                                    <input
                                        type="date"
                                        value={filterState.amountMin || ""}
                                        onChange={e => updateFilter("amountMin", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>

                                {/* AMOUNT MAX */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Amount Max</label>
                                    <input
                                        type="date"
                                        value={filterState.amountMax || ""}
                                        onChange={e => updateFilter("amountMax", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>

                                {/* USER */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">User</label>
                                    <select
                                        value={filterState.user_id || ""}
                                        onChange={e => updateFilter("user_id", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>

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

                                {/* TYPE */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Type</label>
                                    <select
                                        value={filterState.type || ""}
                                        onChange={e => updateFilter("type", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        <option value="first_deposit">FD</option>
                                        <option value="recurring_deposit">RD</option>
                                    </select>
                                </div>

                                {/* STATUS */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Status</label>
                                    <select
                                        value={filterState.status || ""}
                                        onChange={e => updateFilter("status", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        <option value="PENDING">Pending</option>
                                        <option value="PAID">Paid</option>
                                        <option value="FAILED">Failed</option>
                                    </select>
                                </div>

                            </div>

                            {/* BUTTONS */}
                            <div className="flex gap-2 pt-1 text-xs">
                                <button
                                    onClick={applyFilters}
                                    className="border border-primary bg-primary/90 px-3 py-1 text-white hover:bg-primary dark:border-primary dark:text-neutral-900"
                                >
                                    Apply
                                </button>

                                <button
                                    onClick={() => router.visit('/deposits')}
                                    className="border border-neutral-300 bg-white px-3 py-1 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <table className="w-full border border-neutral-200 border-collapse text-[11px] dark:border-neutral-800">
                            <thead>
                                <tr className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Edit</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Date</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Time</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Amount</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Commission</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Type</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Status</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">User</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Project</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Save</th>
                                </tr>
                            </thead>

                            <tbody>

                                {/* EXISTING ROWS */}
                                {rows.map(row => (
                                    <tr 
                                    key={row.id} 
                                    onDoubleClick={() => activateRowEditing(row.id)}
                                    className={`${DepositStatusSettings[row.status]?.classes} ${editingRowId === row.id ? "bg-emerald-50/70 dark:bg-emerald-950/30" : ""}`}>
                                        <td className="border border-neutral-200 p-0 text-center dark:border-neutral-800">
                                            <button
                                                onClick={() => toggleRowEditing(row.id)}
                                                className="mx-auto flex h-6 w-6 items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                            >
                                                {editingRowId === row.id ? (
                                                    <Check className="h-3.5 w-3.5" />
                                                ) : (
                                                    <Pencil className="h-3.5 w-3.5" />
                                                )}
                                            </button>
                                        </td>

                                        {/* DATE */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="date"
                                                    value={row.date ? new Date(row.date).toISOString().split("T")[0] : ""}
                                                    onChange={e => handleChange(row.id, "date", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>
                                                    {row.date ? new Date(row.date).toISOString().split("T")[0] : '—'}
                                                </span>
                                            )}
                                        </td>

                                        {/* TIME */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="time"
                                                    value={row.time}
                                                    onChange={e => handleChange(row.id, "time", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>
                                                    {row.time || '—'}
                                                </span>
                                            )}
                                        </td>

                                        {/* AMOUNT */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800 flex flex-row items-center">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={row.amount}
                                                    onChange={e => handleChange(row.id, "amount", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>
                                                    {row.amount || '—'}
                                                </span>
                                            )}
                                            <span>{row?.project?.currency_code ?? ''}</span>
                                        </td>

                                        {/* COMMISSION */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.commission_id === "" ? "" : String(row.commission_id)}
                                                    onChange={e => handleChange(row.id, "commission_id", e.target.value === "" ? "" : Number(e.target.value))}
                                                    className={sheetInputClasses}
                                                >
                                                    <option value="">-</option>
                                                    {commissions.map(commission => (
                                                        <option key={commission.id} value={commission.id}>{commission.order} - {commission.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={cellTextClasses}>{findCommissionLabel(row.commission_id)}</span>
                                            )}
                                        </td>

                                        {/* TYPE */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.type}
                                                    onChange={e => handleChange(row.id, "type", e.target.value as DepositType)}
                                                    className={`${sheetInputClasses} ${DepositTypeSettings[row.type]?.classes}`}
                                                >
                                                    {Object.entries(DepositTypeSettings).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={cellTextClasses}>{DepositTypeSettings[row.type]?.label || row.type}</span>
                                            )}
                                        </td>

                                        {/* STATUS */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.status}
                                                    onChange={e => handleChange(row.id, "status", e.target.value as DepositStatus)}
                                                    className={sheetInputClasses}
                                                >
                                                    {Object.entries(DepositStatusSettings).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={cellTextClasses}>{DepositStatusSettings[row.status]?.label || row.status}</span>
                                            )}
                                        </td>

                                        {/* USER */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.user_id === "" ? "" : String(row.user_id)}
                                                    onChange={e => handleChange(row.id, "user_id", e.target.value === "" ? "" : Number(e.target.value))}
                                                    className={sheetInputClasses}
                                                >
                                                    <option value="">-</option>
                                                    {users.map(u => (
                                                        <option key={u.id} value={u.id}>{u.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={cellTextClasses}>{findUserName(row.user_id)}</span>
                                            )}
                                        </td>

                                        {/* PROJECT */}
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.project_id === "" ? "" : String(row.project_id)}
                                                    onChange={e => handleChange(row.id, "project_id", e.target.value === "" ? "" : Number(e.target.value))}
                                                    className={sheetInputClasses}
                                                >
                                                    <option value="">-</option>
                                                    {projects.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={cellTextClasses}>{findProjectName(row.project_id)}</span>
                                            )}
                                        </td>
                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            <button
                                                onClick={() => saveRowChanges(row.id)}
                                                disabled={editingRowId !== row.id}
                                                className="dark:text-white flex h-full w-full items-center justify-center bg-primary/80 px-2 py-1 text-[10px] uppercase tracking-wide text-white hover:bg-primary dark:text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {/* NEW DEPOSIT ROW */}
                                <tr className="bg-neutral-50 text-xs dark:bg-neutral-900/40">
                                    <td className="border border-neutral-200 p-0 text-center text-[11px] uppercase text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">New</td>
                                
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>

                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="time"
                                            value={form.time}
                                            onChange={e => setForm({ ...form, time: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>

                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>

                                    {/* COMMISSION */}
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.commission_id}
                                            onChange={e => setForm({ ...form, commission_id: e.target.value })}
                                            className={sheetInputClasses}
                                        >
                                            <option value="">-</option>
                                            {commissions.map(commission => (
                                                <option key={commission.id} value={commission.id}>{commission.order} - {commission.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* TYPE */}
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className={sheetInputClasses}
                                        >
                                            <option value="">-</option>
                                            {Object.entries(DepositTypeSettings).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* STATUS */}
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.status}
                                            onChange={e => setForm({ ...form, status: e.target.value })}
                                            className={sheetInputClasses}
                                        >
                                            <option value="">-</option>
                                            {Object.entries(DepositStatusSettings).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* USER */}
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.user_id}
                                            onChange={e => setForm({ ...form, user_id: e.target.value })}
                                            className={sheetInputClasses}
                                        >
                                            <option value="">-</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </td>

                                    {/* PROJECT */}
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: e.target.value })}
                                            className={sheetInputClasses}
                                        >
                                            <option value="">-</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                        <button
                                            onClick={saveNewDeposit}
                                            className="flex h-full w-full items-center justify-center border border-primary bg-primary px-3 py-1 text-[11px] uppercase tracking-wide text-white hover:opacity-90 dark:text-neutral-900"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                        <div className="flex w-full pt-2" ref={bottomRef}>
                            <button 
                                onClick={scrollToTop}
                                className="ml-auto border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
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
