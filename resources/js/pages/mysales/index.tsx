import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Check, DollarSign, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

type Project = { id: number; name: string };
type Commission = { id: number; name: string; order: number; project_id: number };

const DepositTypeSettings = {
    first_deposit: { label: "FD", classes: "!bg-yellow-400" },
    recurring_deposit: { label: "RD", classes: "!bg-red-400" },
} as const;

const DepositStatusSettings = {
    PENDING: { label: "Pending", classes: "" },
    PAID: { label: "Paid", classes: "!bg-green-200 dark:!bg-green-900/60" },
    FAILED: { label: "Failed", classes: "!bg-red-200 dark:!bg-red-900/60" },
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

type EditableDeposit = Omit<Deposit, 'project_id' | 'commission_id' | 'amount' | 'time'> & {
    time: string;
    amount: string;
    project_id: number | '';
    commission_id: number | '';
};

type Props = {
    deposits: Deposit[];
    projects: Project[];
    commissions: Commission[];
    projectsByDate: Record<string, number[]>;
    filters: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'My Sales', href: '/my-sales' },
];

export default function MySalesIndex({ deposits, commissions, projectsByDate, projects, filters }: Props) {
    const bottomRef = useRef<HTMLDivElement | null>(null);
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

    const updateFilter = (key: string, value: any) => setFilterState(prev => ({ ...prev, [key]: value }));

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filterState).forEach(([k, v]) => v && params.set(k, v));
        router.visit(`/my-sales?${params.toString()}`, { preserveScroll: true });
    };

    const [rows, setRows] = useState<EditableDeposit[]>(() =>
        deposits.map(d => ({
            ...d,
            date: d.date ? new Date(d.date).toISOString().split("T")[0] : "",
            time: d.time?.slice(0, 5) ?? "",
            project_id: d.project?.id ?? "",
            commission_id: d.commission_id ?? "",
            amount: d.amount?.toString() ?? '',
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
            project_id: row.project_id === "" ? null : row.project_id,
            commission_id: row.commission_id === "" ? null : row.commission_id,
            amount: row.amount === "" ? null : Number(row.amount),
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
            toast.success('Saved');
            return true;
        }

        toast.error(data.message);
        return false;
    };

    const saveRowChanges = async (rowId: number) => {
        const currentRow = rows.find(r => r.id === rowId);
        if (!currentRow) return;
        const success = await saveRow(currentRow);
        if (success) setEditingRowId(null);
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

    const commissionsForProject = (
        projectId: number | string | '',
        currentCommissionId?: number | string | ''
    ) => {
        const hasProject = projectId !== '' && projectId !== null && projectId !== undefined;
        let options = hasProject ? commissions.filter(c => c.project_id === Number(projectId)) : [];

        if (currentCommissionId !== '' && currentCommissionId !== null && currentCommissionId !== undefined) {
            const current = commissions.find(c => c.id === Number(currentCommissionId));
            if (current && !options.some(c => c.id === current.id)) {
                options = [...options, current];
            }
        }

        return options;
    };

    const buildProjectOptions = (allowedIds: number[], currentProjectId: number | string | '') => {
        const allowedSet = new Set<number>(allowedIds);

        if (currentProjectId !== '' && currentProjectId !== null && currentProjectId !== undefined) {
            allowedSet.add(Number(currentProjectId));
        }

        if (allowedSet.size === 0) {
            return [] as Project[];
        }

        return projects.filter(p => allowedSet.has(p.id));
    };

    const projectOptionsForRow = (date: string, currentProjectId: number | string | '') => {
        return buildProjectOptions(getAvailableProjects(date), currentProjectId);
    };

    const getAvailableProjects = (date: string) => {
        if (!date) return projects.map(p => p.id);
        return projectsByDate[date] || [];
    };

    const toggleRowEditing = (rowId: number) => setEditingRowId(prev => (prev === rowId ? null : rowId));
    const activateRowEditing = (rowId: number) => setEditingRowId(rowId);

    const handleChange = (rowId: number, field: keyof EditableDeposit, value: any) => {
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
    };

    const [form, setForm] = useState({
        date: new Date().toISOString().slice(0, 10),
        time: '',
        amount: '',
        status: '',
        type: '',
        commission_id: '',
        project_id: '',
    });

    const availableProjectsForForm = form.date ? projectsByDate[form.date] || [] : [];
    const projectOptionsForForm = buildProjectOptions(availableProjectsForForm, form.project_id);

    const salesStats = useMemo(() => {
        return rows.reduce(
            (acc, row) => {
                const amount = Number(row.amount) || 0;
                acc.totalCount += 1;
                acc.totalAmount += amount;

                if (row.status === 'PAID') {
                    acc.paid.count += 1;
                    acc.paid.amount += amount;
                } else if (row.status === 'PENDING') {
                    acc.pending.count += 1;
                    acc.pending.amount += amount;
                } else if (row.status === 'FAILED') {
                    acc.failed.count += 1;
                    acc.failed.amount += amount;
                }

                if (row.type === 'first_deposit') {
                    acc.fd.count += 1;
                    acc.fd.amount += amount;
                } else if (row.type === 'recurring_deposit') {
                    acc.rd.count += 1;
                    acc.rd.amount += amount;
                }

                return acc;
            },
            {
                totalCount: 0,
                totalAmount: 0,
                paid: { count: 0, amount: 0 },
                pending: { count: 0, amount: 0 },
                failed: { count: 0, amount: 0 },
                fd: { count: 0, amount: 0 },
                rd: { count: 0, amount: 0 },
            }
        );
    }, [rows]);

    const formatCurrency = (value: number) =>
        value.toLocaleString(undefined, { maximumFractionDigits: 2 });

    const saveNewDeposit = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = {
            ...form,
            time: form.time ? form.time + ":00" : null,
            amount: form.amount ? Number(form.amount) : null,
            commission_id: form.commission_id ? Number(form.commission_id) : null,
            project_id: form.project_id ? Number(form.project_id) : null,
        };

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
            const newRow: EditableDeposit = {
                ...data.deposit,
                date: data.deposit.date ? new Date(data.deposit.date).toISOString().split("T")[0] : "",
                time: data.deposit.time?.slice(0, 5) ?? "",
                project_id: data.deposit.project_id ?? "",
                commission_id: data.deposit.commission_id ?? "",
                amount: data.deposit.amount?.toString() ?? '',
            };

            setRows(prev => [newRow, ...prev]);
            setForm({ date: '', time: '', amount: '', status: '', type: '', commission_id: '', project_id: '' });
            toast.success("Created");
        } else {
            toast.error(data.message);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Sales" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <DollarSign className="h-5 w-5" />
                                My Sales
                            </h1>
                            <button
                                onClick={scrollToBottom}
                                className="ml-auto border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                ↓ Bottom
                            </button>
                        </div>

                        <div className="mb-2 space-y-2 border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filters</h2>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Date Start</label>
                                    <input
                                        type="date"
                                        value={filterState.dateStart}
                                        onChange={e => updateFilter("dateStart", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Date End</label>
                                    <input
                                        type="date"
                                        value={filterState.dateEnd}
                                        onChange={e => updateFilter("dateEnd", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Amount Min</label>
                                    <input
                                        type="number"
                                        value={filterState.amountMin}
                                        onChange={e => updateFilter("amountMin", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Amount Max</label>
                                    <input
                                        type="number"
                                        value={filterState.amountMax}
                                        onChange={e => updateFilter("amountMax", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Project</label>
                                    <select
                                        value={filterState.project_id}
                                        onChange={e => updateFilter("project_id", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Commission</label>
                                    <select
                                        value={filterState.commission_id}
                                        onChange={e => updateFilter("commission_id", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        {commissions.map(c => (
                                            <option key={c.id} value={c.id}>{c.order} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Type</label>
                                    <select
                                        value={filterState.type}
                                        onChange={e => updateFilter("type", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        <option value="first_deposit">FD</option>
                                        <option value="recurring_deposit">RD</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Status</label>
                                    <select
                                        value={filterState.status}
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

                            <div className="flex gap-2 pt-1 text-xs">
                                <button
                                    onClick={applyFilters}
                                    className="border border-primary bg-primary/90 px-3 py-1 text-white hover:bg-primary dark:border-primary dark:text-neutral-900"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={() => router.visit('/my-sales')}
                                    className="border border-neutral-300 bg-white px-3 py-1 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="border border-neutral-200 bg-white p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Statistics</h2>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="font-semibold">
                                        Total rows: {salesStats.totalCount}
                                    </p>
                                    <p className="font-semibold">
                                        Total amount: ${formatCurrency(salesStats.totalAmount)}
                                    </p>
                                </div>
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="text-green-500 dark:text-green-400">
                                        Paid: {salesStats.paid.count} (${formatCurrency(salesStats.paid.amount)})
                                    </p>
                                    <p className="text-yellow-500 dark:text-yellow-400">
                                        Pending: {salesStats.pending.count} (${formatCurrency(salesStats.pending.amount)})
                                    </p>
                                    <p className="text-red-500 dark:text-red-400">
                                        Failed: {salesStats.failed.count} (${formatCurrency(salesStats.failed.amount)})
                                    </p>
                                </div>
                                <div className="space-y-0.5 text-[11px]">
                                    <p className="font-semibold">
                                        FD: {salesStats.fd.count} (${formatCurrency(salesStats.fd.amount)})
                                    </p>
                                    <p className="font-semibold">
                                        RD: {salesStats.rd.count} (${formatCurrency(salesStats.rd.amount)})
                                    </p>
                                </div>
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
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Project</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Save</th>
                                </tr>
                            </thead>
                            <tbody>

                                {rows.map(row => {
                                    const projectOptions = projectOptionsForRow(row.date, row.project_id);
                                    const availableRowCommissions = commissionsForProject(row.project_id, row.commission_id);

                                    return (
                                        <tr
                                            key={row.id}
                                            onDoubleClick={() => activateRowEditing(row.id)}
                                            className={`${DepositStatusSettings[row.status]?.classes} ${editingRowId === row.id ? "bg-emerald-50/70 dark:bg-emerald-950/30" : ""}`}
                                        >
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

                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="date"
                                                        value={row.date || ""}
                                                        onChange={e => handleChange(row.id, "date", e.target.value)}
                                                        className={sheetInputClasses}
                                                    />
                                                ) : (
                                                    <span className={cellTextClasses}>
                                                        {row.date || '—'}
                                                    </span>
                                                )}
                                            </td>

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

                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={row.amount}
                                                        onChange={e => handleChange(row.id, "amount", e.target.value)}
                                                        className={sheetInputClasses}
                                                    />
                                                ) : (
                                                    <span className={cellTextClasses}>
                                                        {row.amount || '—'}
                                                    </span>
                                                )}
                                            </td>

                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        value={row.commission_id === "" ? "" : String(row.commission_id)}
                                                        onChange={e => handleChange(row.id, "commission_id", e.target.value === "" ? "" : Number(e.target.value))}
                                                        className={sheetInputClasses}
                                                    >
                                                        <option value="">-</option>
                                                        {availableRowCommissions.map(commission => (
                                                            <option key={commission.id} value={commission.id}>
                                                                {commission.order} - {commission.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={cellTextClasses}>{findCommissionLabel(row.commission_id)}</span>
                                                )}
                                            </td>

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

                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        value={row.project_id === "" ? "" : String(row.project_id)}
                                                        onChange={e => handleChange(row.id, "project_id", e.target.value === "" ? "" : Number(e.target.value))}
                                                        className={sheetInputClasses}
                                                    >
                                                        <option value="">-</option>
                                                        {projectOptions.map(p => (
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
                                                    className="flex h-full w-full items-center justify-center bg-primary/80 px-2 py-1 text-[10px] uppercase tracking-wide text-white hover:bg-primary dark:text-neutral-900 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800"
                                                >
                                                    Save
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                <tr className="bg-neutral-50 text-xs dark:bg-neutral-900/40">
                                    <td className="border border-neutral-200 p-0 text-center text-[11px] uppercase text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                                        New
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value, project_id: '', commission_id: '' })}
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
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.commission_id}
                                            onChange={e => setForm({ ...form, commission_id: e.target.value })}
                                            className={sheetInputClasses}
                                        >
                                            <option value="">-</option>
                                            {commissionsForProject(form.project_id).map(commission => (
                                                <option key={commission.id} value={commission.id}>
                                                    {commission.order} - {commission.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
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
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: e.target.value, commission_id: '' })}
                                            className={sheetInputClasses}
                                            disabled={!form.date}
                                        >
                                            <option value="">-</option>
                                            {projectOptionsForForm.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
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
                                ↑ Top
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
