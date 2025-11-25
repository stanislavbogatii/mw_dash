import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { type JSX, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar, Check, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { isFieldVisible, isFieldVisibleForm } from '@/lib/salarySchemeIsFieldVisible';


type Project = { id: number; name: string };
// type start
const SalarySchemeTypeSettings = {
    FIX: { label: "FIX", classes: "!bg-yellow-400" },
    PER_DEPOSIT: { label: "PER_DEPOSIT", classes: "!bg-red-400" },
    PER_INCOME: { label: "PER_INCOME", classes: "!bg-blue-400" },
    FROM_SPEND: { label: "FROM_SPEND", classes: "!bg-gray-400" },
    FROM_TOTAL_PROFIT: { label: "FROM_TOTAL_PROFIT", classes: "!bg-gray-400" },
    FROM_TOTAL_INCOME: { label: "FROM_TOTAL_INCOME", classes: "!bg-gray-400" },
} as const;

enum SalarySchemeTypeEnum {
    FIX = 'FIX',
    PER_DEPOSIT = 'PER_DEPOSIT',
    PER_INCOME = 'PER_INCOME',
    FROM_SPEND = 'FROM_SPEND',
    FROM_TOTAL_PROFIT = 'FROM_TOTAL_PROFIT',
    FROM_TOTAL_INCOME = 'FROM_TOTAL_INCOME',
}
// type end

// position type start
const SalarySchemePositionTypeSettings = {
    FD: { label: "FD", classes: "!bg-yellow-400" },
    RD: { label: "RD", classes: "!bg-red-400" },
    BUYING: { label: "BUYING", classes: "!bg-blue-400" },
    ALL: { label: "ALL", classes: "!bg-gray-400" },
    PERSONAL: { label: "PERSONAL", classes: "!bg-gray-400" },
} as const;

enum SalarySchemePositionTypeEnum {
    FD = 'FD',
    RD = 'RD',
    BUYING = 'BUYING',
    ALL = 'ALL',
    PERSONAL = 'PERSONAL',
}
// position type end

// value type start
enum SalarySchemeValueTypeEnum {
    percent = 'percent',
    amount = 'amount',
}

const SalarySchemeValueTypeSettings = {
    percent: { label: "%", classes: "!bg-yellow-400" },
    amount: { label: "$", classes: "!bg-red-400" },
} as const;
// value type end

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    project_id?: string;
    user_id?: string
};

type SalaryScheme = {
    id: number;
    date: string;
    value: number;
    type: SalarySchemeTypeEnum,
    min?: number;
    max?: number;
    position_type: SalarySchemePositionTypeEnum;
    value_type: SalarySchemeValueTypeEnum;
    project_id: number;
    user_id?: number;
}

type EditableSalaryScheme = Omit<SalaryScheme, 'value' | 'min' | 'max' | 'project_id' | 'user_id'> & {
    value: string;
    min: string;
    max: string;
    project_id: number | '';
    user_id: number | '';
};

type User = {
    id: number;
    name: string;
}

type Props = {
    projects: Project[];
    filters: Filters;
    salarySchemes: SalaryScheme[];
    users: User[]
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Salary schemes', href: '/salary-scheme' },
];

const getTypeLabel = (value: SalarySchemeTypeEnum | '' | undefined) =>
    value ? (SalarySchemeTypeSettings[value]?.label ?? value) : '—';

const getPositionTypeLabel = (value: SalarySchemePositionTypeEnum | '' | undefined) =>
    value ? (SalarySchemePositionTypeSettings[value]?.label ?? value) : '—';

const getValueTypeLabel = (value: SalarySchemeValueTypeEnum | '' | undefined) =>
    value ? (SalarySchemeValueTypeSettings[value]?.label ?? value) : '—';

export default function SalarySchemeIndex({ salarySchemes, projects, users, filters }: Props) {
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
        user_id: filters.user_id || "",
    });

    const updateFilter = (key: string, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        Object.entries(filterState).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });

        router.visit(`/salary-scheme?${params.toString()}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };


    const [rows, setRows] = useState<EditableSalaryScheme[]>(() => 
        salarySchemes.map(k => ({
            ...k,
            date: new Date(k.date).toISOString().split('T')[0],
            value: k.value?.toString() ?? '',
            min: k.min?.toString() ?? '',
            max: k.max?.toString() ?? '',
            project_id: k.project_id ?? '',
            user_id: k.user_id ?? '',
        }))
    );

    const [editingRowId, setEditingRowId] = useState<number | null>(null);

    const sheetInputClasses =
        "w-full border-none bg-transparent px-1 py-0.5 text-[11px] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary/40";
    const cellTextClasses =
        "block px-1 py-0.5 text-[11px] font-medium text-neutral-900 dark:text-neutral-100";
    const filterFieldClasses =
        "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

    const findProjectName = (id: number | '') => {
        if (!id) return '—';
        return projects.find(p => p.id === Number(id))?.name ?? '—';
    };

    const findUserName = (id: number | '') => {
        if (!id) return '—';
        return users.find(u => u.id === Number(id))?.name ?? '—';
    };

    const saveRow = async (row: EditableSalaryScheme) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...row,
            project_id: row.project_id === '' ? null : Number(row.project_id),
            user_id: row.user_id === '' ? null : Number(row.user_id),
            value: row.value === '' ? null : Number(row.value),
            min: row.min === '' ? null : Number(row.min),
            max: row.max === '' ? null : Number(row.max),
        };

        const response = await fetch(`/api/salary-scheme/${row.id}`, {
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
            toast.success('Salary scheme updated successfully');
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

    const toggleRowEditing = (rowId: number) => {
        setEditingRowId(prev => (prev === rowId ? null : rowId));
    };

    const activateRowEditing = (rowId: number) => {
        setEditingRowId(rowId);
    };

    const handleChange = (rowId: number, field: keyof EditableSalaryScheme, value: any) => {
        const updatedRows = rows.map(r =>
            r.id === rowId ? { ...r, [field]: value } : r
        );
        setRows(updatedRows);
    };

    const [form, setForm] = useState({
        date: '',
        project_id: '',
        user_id: '',
        value: '',
        type: '',
        value_type: '',
        min: '',
        max: '',
        position_type: ''
    });

    const saveNewSalaryScheme = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const payload = {
            ...form,
            project_id: form.project_id === '' ? null : Number(form.project_id),
            user_id: form.user_id === '' ? null : Number(form.user_id),
            value: form.value === '' ? null : Number(form.value),
            min: form.min === '' ? null : Number(form.min),
            max: form.max === '' ? null : Number(form.max),
        };

        const response = await fetch('/api/salary-scheme', {
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

            const formattedRow: EditableSalaryScheme = {
                ...data.salaryScheme,
                date: data.salaryScheme.date ? new Date(data.salaryScheme.date).toISOString().split('T')[0] : '',
                project_id: data.salaryScheme.project_id ?? '',
                user_id: data.salaryScheme.user_id ?? '',
                value: data.salaryScheme.value?.toString() ?? '',
                type: data.salaryScheme.type,
                value_type: data.salaryScheme.value_type,
                position_type: data.salaryScheme.position_type,
                min: data.salaryScheme.min?.toString() ?? '',
                max: data.salaryScheme.max?.toString() ?? '',
            };

            const getDateValue = (value: string) => value ? new Date(value).getTime() : 0;
            setRows(prev => [...prev, formattedRow].sort((a, b) => getDateValue(a.date) - getDateValue(b.date)));

            setForm({
                date: '',
                project_id: '',
                user_id: '',
                value: '',
                type: '',
                value_type: '',
                min: '',
                max: '',
                position_type: ''
            });
            toast.success('SalaryScheme created successfully');
        } else {
            toast.error(data.message);
        }
    };

    const renderCell = (row: EditableSalaryScheme, field: string, content: JSX.Element) => {
        return isFieldVisible(row as unknown as SalaryScheme, field)
            ? content
            : <td className="border border-neutral-200 p-0 dark:border-neutral-800"></td>;
    };

    const renderFormCell = (formState: typeof form, field: string, content: JSX.Element) => {
        return isFieldVisibleForm(formState as unknown as SalaryScheme, field)
            ? content
            : <td className="border border-neutral-200 p-0 dark:border-neutral-800"></td>;
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SalaryScheme" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <Calendar className="h-5 w-5" />
                                Salary scheme
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
                                    onClick={() => router.visit('/salary-scheme')}
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
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Project</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">User</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Value</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Type</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Position type</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">$ / %</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Min</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Max</th>
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

                                        {renderCell(row, "date", (
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
                                        ))}

                                        {renderCell(row, "project_id", (
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
                                        ))}

                                        {renderCell(row, "user_id", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        value={row.user_id === '' ? '' : String(row.user_id)}
                                                        onChange={e => handleChange(row.id, "user_id", e.target.value === '' ? '' : Number(e.target.value))}
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
                                        ))}

                                        {renderCell(row, "value", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="number"
                                                        value={row.value}
                                                        onChange={e => handleChange(row.id, "value", e.target.value)}
                                                        className={sheetInputClasses}
                                                    />
                                                ) : (
                                                    <span className={cellTextClasses}>{row.value || '—'}</span>
                                                )}
                                            </td>
                                        ))}

                                        {renderCell(row, "type", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        value={row.type}
                                                        onChange={e => handleChange(row.id, "type", e.target.value as SalarySchemeTypeEnum)}
                                                        className={sheetInputClasses}
                                                    >
                                                        <option value="">-</option>
                                                        {Object.entries(SalarySchemeTypeSettings).map(([key, val]) => (
                                                            <option key={key} value={key}>{val.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={cellTextClasses}>{getTypeLabel(row.type)}</span>
                                                )}
                                            </td>
                                        ))}

                                        {renderCell(row, "position_type", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        value={row.position_type}
                                                        onChange={e => handleChange(row.id, "position_type", e.target.value as SalarySchemePositionTypeEnum)}
                                                        className={sheetInputClasses}
                                                    >
                                                        <option value="">-</option>
                                                        {Object.entries(SalarySchemePositionTypeSettings).map(([key, val]) => (
                                                            <option key={key} value={key}>{val.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={cellTextClasses}>{getPositionTypeLabel(row.position_type)}</span>
                                                )}
                                            </td>
                                        ))}

                                        {renderCell(row, "value_type", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <select
                                                        value={row.value_type}
                                                        onChange={e => handleChange(row.id, "value_type", e.target.value as SalarySchemeValueTypeEnum)}
                                                        className={sheetInputClasses}
                                                    >
                                                        <option value="">-</option>
                                                        {Object.entries(SalarySchemeValueTypeSettings).map(([key, val]) => (
                                                            <option key={key} value={key}>{val.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className={cellTextClasses}>{getValueTypeLabel(row.value_type)}</span>
                                                )}
                                            </td>
                                        ))}

                                        {renderCell(row, "min", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="number"
                                                        value={row.min}
                                                        onChange={e => handleChange(row.id, "min", e.target.value)}
                                                        className={sheetInputClasses}
                                                    />
                                                ) : (
                                                    <span className={cellTextClasses}>{row.min || '—'}</span>
                                                )}
                                            </td>
                                        ))}

                                        {renderCell(row, "max", (
                                            <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                                {editingRowId === row.id ? (
                                                    <input
                                                        type="number"
                                                        value={row.max}
                                                        onChange={e => handleChange(row.id, "max", e.target.value)}
                                                        className={sheetInputClasses}
                                                    />
                                                ) : (
                                                    <span className={cellTextClasses}>{row.max || '—'}</span>
                                                )}
                                            </td>
                                        ))}

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

                                    {renderFormCell(form, "date", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <input
                                                type="date"
                                                value={form.date}
                                                onChange={e => setForm({ ...form, date: e.target.value })}
                                                className={sheetInputClasses}
                                            />
                                        </td>
                                    ))}

                                    {renderFormCell(form, "project_id", (
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
                                    ))}

                                    {renderFormCell(form, "user_id", (
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
                                    ))}

                                    {renderFormCell(form, "value", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <input
                                                type="number"
                                                value={form.value}
                                                onChange={e => setForm({ ...form, value: e.target.value })}
                                                className={sheetInputClasses}
                                            />
                                        </td>
                                    ))}

                                    {renderFormCell(form, "type", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <select
                                                value={form.type}
                                                onChange={e => setForm({ ...form, type: e.target.value })}
                                                className={sheetInputClasses}
                                            >
                                                <option value="">-</option>
                                                {Object.entries(SalarySchemeTypeSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    ))}

                                    {renderFormCell(form, "position_type", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <select
                                                value={form.position_type}
                                                onChange={e => setForm({ ...form, position_type: e.target.value })}
                                                className={sheetInputClasses}
                                            >
                                                <option value="">-</option>
                                                {Object.entries(SalarySchemePositionTypeSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    ))}

                                    {renderFormCell(form, "value_type", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <select
                                                value={form.value_type}
                                                onChange={e => setForm({ ...form, value_type: e.target.value })}
                                                className={sheetInputClasses}
                                            >
                                                <option value="">-</option>
                                                {Object.entries(SalarySchemeValueTypeSettings).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                    ))}

                                    {renderFormCell(form, "min", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <input
                                                type="number"
                                                value={form.min}
                                                onChange={e => setForm({ ...form, min: e.target.value })}
                                                className={sheetInputClasses}
                                            />
                                        </td>
                                    ))}

                                    {renderFormCell(form, "max", (
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <input
                                                type="number"
                                                value={form.max}
                                                onChange={e => setForm({ ...form, max: e.target.value })}
                                                className={sheetInputClasses}
                                            />
                                        </td>
                                    ))}

                                    <td className="border border-neutral-200 p-0 text-right dark:border-neutral-800">
                                        <button
                                            onClick={saveNewSalaryScheme}
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
