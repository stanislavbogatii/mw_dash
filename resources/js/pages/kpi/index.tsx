import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar, Check, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

type Project = { id: number; name: string };

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    project_id?: string;
};

type Kpi = {
    id: number;
    date: string;
    project_id: number | null;
    project?: Project | null;
    total_spend: number | null;
    total_subscribers: number | null;
    total_dialogs: number | null;
    total_income: number | null;
    total_deposits: number | null;
    fd_income: number | null;
    rd_income: number | null;
    fd_deposits: number | null;
    rd_deposits: number | null;
};

type EditableKpi = {
    id: number;
    date: string;
    project_id: number | '';
    total_spend: string;
    total_subscribers: string;
    total_dialogs: string;
    total_income: string;
    total_deposits: string;
    fd_income: string;
    rd_income: string;
    fd_deposits: string;
    rd_deposits: string;
};

type Props = {
    projects: Project[];
    filters: Filters;
    kpi: Kpi[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'KPI', href: '/kpi' },
];

const metricKeys: Array<keyof Pick<EditableKpi,
    'total_spend' | 'total_subscribers' | 'total_dialogs' | 'total_income' |
    'total_deposits' | 'fd_income' | 'rd_income' | 'fd_deposits' | 'rd_deposits'>> = [
    'total_spend',
    'total_subscribers',
    'total_dialogs',
    'total_income',
    'total_deposits',
    'fd_income',
    'rd_income',
    'fd_deposits',
    'rd_deposits',
];

const numberFromString = (value: string) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const formatMetric = (value: string) => {
    if (!value && value !== '0') return '—';
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return value || '—';
    return parsed.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export default function KpiIndex({ kpi, projects, filters }: Props) {
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

    const [rows, setRows] = useState<EditableKpi[]>(() =>
        kpi.map(item => ({
            id: item.id,
            date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
            project_id: item.project_id ?? '',
            total_spend: item.total_spend?.toString() ?? '',
            total_subscribers: item.total_subscribers?.toString() ?? '',
            total_dialogs: item.total_dialogs?.toString() ?? '',
            total_income: item.total_income?.toString() ?? '',
            total_deposits: item.total_deposits?.toString() ?? '',
            fd_income: item.fd_income?.toString() ?? '',
            rd_income: item.rd_income?.toString() ?? '',
            fd_deposits: item.fd_deposits?.toString() ?? '',
            rd_deposits: item.rd_deposits?.toString() ?? '',
        }))
    );

    const [editingRowId, setEditingRowId] = useState<number | null>(null);

    const sheetInputClasses =
        "w-full border-none bg-transparent px-1 py-0.5 text-[11px] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary/40";
    const cellTextClasses =
        "block px-1 py-0.5 text-[11px] font-medium text-neutral-900 dark:text-neutral-100";
    const filterFieldClasses =
        "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
    const primaryButtonClasses =
        "border border-primary bg-primary/90 px-3 py-1 text-xs text-white hover:bg-primary dark:border-primary dark:text-neutral-900";
    const secondaryButtonClasses =
        "border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
    const ghostButtonClasses =
        "border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";

    const findProjectName = (id: number | '') => {
        if (!id) return '—';
        return projects.find(p => p.id === Number(id))?.name ?? '—';
    };

    const saveRow = async (row: EditableKpi) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...row,
            project_id: row.project_id === '' ? null : Number(row.project_id),
            total_spend: numberFromString(row.total_spend),
            total_subscribers: numberFromString(row.total_subscribers),
            total_dialogs: numberFromString(row.total_dialogs),
            total_income: numberFromString(row.total_income),
            total_deposits: numberFromString(row.total_deposits),
            fd_income: numberFromString(row.fd_income),
            rd_income: numberFromString(row.rd_income),
            fd_deposits: numberFromString(row.fd_deposits),
            rd_deposits: numberFromString(row.rd_deposits),
        };

        const response = await fetch(`/api/kpi/${row.id}`, {
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
            toast.success('KPI updated successfully');
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

    const handleChange = (rowId: number, field: keyof EditableKpi, value: any) => {
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
    };

    const toggleRowEditing = (rowId: number) => {
        setEditingRowId(prev => (prev === rowId ? null : rowId));
    };

    const activateRowEditing = (rowId: number) => setEditingRowId(rowId);

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

    const saveNewKpi = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...form,
            project_id: form.project_id === '' ? null : Number(form.project_id),
            total_spend: numberFromString(form.total_spend),
            total_subscribers: numberFromString(form.total_subscribers),
            total_dialogs: numberFromString(form.total_dialogs),
            total_income: numberFromString(form.total_income),
            total_deposits: numberFromString(form.total_deposits),
            fd_income: numberFromString(form.fd_income),
            rd_income: numberFromString(form.rd_income),
            fd_deposits: numberFromString(form.fd_deposits),
            rd_deposits: numberFromString(form.rd_deposits),
        };

        const response = await fetch('/api/kpi', {
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

            const formattedRow: EditableKpi = {
                id: data.kpi.id,
                date: data.kpi.date ? new Date(data.kpi.date).toISOString().split('T')[0] : '',
                project_id: data.kpi.project_id ?? '',
                total_spend: data.kpi.total_spend?.toString() ?? '',
                total_subscribers: data.kpi.total_subscribers?.toString() ?? '',
                total_dialogs: data.kpi.total_dialogs?.toString() ?? '',
                total_income: data.kpi.total_income?.toString() ?? '',
                total_deposits: data.kpi.total_deposits?.toString() ?? '',
                fd_income: data.kpi.fd_income?.toString() ?? '',
                rd_income: data.kpi.rd_income?.toString() ?? '',
                fd_deposits: data.kpi.fd_deposits?.toString() ?? '',
                rd_deposits: data.kpi.rd_deposits?.toString() ?? '',
            };

            const getDateValue = (value: string) => value ? new Date(value).getTime() : 0;
            setRows(prev => [...prev, formattedRow].sort((a, b) => getDateValue(a.date) - getDateValue(b.date)));

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
                rd_deposits: '',
            });
            toast.success('KPI created successfully');
        } else {
            toast.error(data.message);
        }
    };

    const totals = useMemo(() => {
        const sum = metricKeys.reduce<Record<string, number>>((acc, key) => {
            acc[key] = rows.reduce((total, row) => {
                const val = Number(row[key] as string) || 0;
                return total + val;
            }, 0);
            return acc;
        }, {} as Record<string, number>);

        return sum;
    }, [rows]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="KPI" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <Calendar className="h-5 w-5" />
                                KPI
                            </h1>
                            
                            <button 
                                onClick={scrollToBottom}
                                className={`ml-auto ${ghostButtonClasses}`}
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
                                    onClick={() => router.visit('/kpi')}
                                    className={secondaryButtonClasses}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <div className="border border-neutral-200 bg-white p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Statistics</h2>
                            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="text-[11px]">
                                    <p className="font-semibold">Spend: {formatMetric(totals.total_spend?.toString() ?? '')}</p>
                                    <p className="font-semibold">Income: {formatMetric(totals.total_income?.toString() ?? '')}</p>
                                    <p className="font-semibold">Deposits: {formatMetric(totals.total_deposits?.toString() ?? '')}</p>
                                </div>
                                <div className="text-[11px]">
                                    <p className="font-semibold">Subscribers: {formatMetric(totals.total_subscribers?.toString() ?? '')}</p>
                                    <p className="font-semibold">Dialogs: {formatMetric(totals.total_dialogs?.toString() ?? '')}</p>
                                </div>
                                <div className="text-[11px]">
                                    <p className="font-semibold">FD Income: {formatMetric(totals.fd_income?.toString() ?? '')}</p>
                                    <p className="font-semibold">RD Income: {formatMetric(totals.rd_income?.toString() ?? '')}</p>
                                    <p className="font-semibold">FD Deposits: {formatMetric(totals.fd_deposits?.toString() ?? '')} / RD: {formatMetric(totals.rd_deposits?.toString() ?? '')}</p>
                                </div>
                            </div>
                        </div>

                        <table className="w-full border border-neutral-200 border-collapse text-[11px] dark:border-neutral-800">
                            <thead>
                                <tr className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Edit</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Date</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Project</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Spend</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Subscribers</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Dialogs</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Income</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Deposits</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">FD Income</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">RD Income</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">FD Deposits</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">RD Deposits</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Save</th>
                                </tr>
                            </thead>

                            <tbody>

                                {rows.map(row => (
                                    <tr 
                                        key={row.id}
                                        onDoubleClick={() => activateRowEditing(row.id)}
                                        className={`${editingRowId === row.id ? "bg-emerald-50/70 dark:bg-emerald-950/30" : ""}`}
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
                                                    value={row.date}
                                                    onChange={e => handleChange(row.id, "date", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{row.date || '—'}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.project_id === '' ? '' : String(row.project_id)}
                                                    onChange={e => handleChange(row.id, "project_id", e.target.value === '' ? '' : Number(e.target.value))}
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
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.total_spend}
                                                    onChange={e => handleChange(row.id, "total_spend", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.total_spend)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.total_subscribers}
                                                    onChange={e => handleChange(row.id, "total_subscribers", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.total_subscribers)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.total_dialogs}
                                                    onChange={e => handleChange(row.id, "total_dialogs", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.total_dialogs)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.total_income}
                                                    onChange={e => handleChange(row.id, "total_income", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.total_income)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.total_deposits}
                                                    onChange={e => handleChange(row.id, "total_deposits", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.total_deposits)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.fd_income}
                                                    onChange={e => handleChange(row.id, "fd_income", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.fd_income)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.rd_income}
                                                    onChange={e => handleChange(row.id, "rd_income", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.rd_income)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.fd_deposits}
                                                    onChange={e => handleChange(row.id, "fd_deposits", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.fd_deposits)}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="number"
                                                    value={row.rd_deposits}
                                                    onChange={e => handleChange(row.id, "rd_deposits", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{formatMetric(row.rd_deposits)}</span>
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
                                ))}

                                <tr className="bg-neutral-50 text-xs dark:bg-neutral-900/40">
                                    <td className="border border-neutral-200 p-0 text-center text-[11px] uppercase text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                                        New
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
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
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.total_spend}
                                            onChange={e => setForm({ ...form, total_spend: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.total_subscribers}
                                            onChange={e => setForm({ ...form, total_subscribers: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.total_dialogs}
                                            onChange={e => setForm({ ...form, total_dialogs: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.total_income}
                                            onChange={e => setForm({ ...form, total_income: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.total_deposits}
                                            onChange={e => setForm({ ...form, total_deposits: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.fd_income}
                                            onChange={e => setForm({ ...form, fd_income: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.rd_income}
                                            onChange={e => setForm({ ...form, rd_income: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.fd_deposits}
                                            onChange={e => setForm({ ...form, fd_deposits: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="number"
                                            value={form.rd_deposits}
                                            onChange={e => setForm({ ...form, rd_deposits: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>
                                    <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                        <button
                                            onClick={saveNewKpi}
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
