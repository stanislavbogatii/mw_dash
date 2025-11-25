import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar, Check, Pencil } from 'lucide-react';
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

type EditableShift = {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    type: ShiftType;
    user_id: number | '';
    project_id: number | '';
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

    const [rows, setRows] = useState<EditableShift[]>(() =>
        shifts.map(s => ({
            id: s.id,
            date: s.date ? new Date(s.date).toISOString().split('T')[0] : '',
            start_time: s.start_time?.slice(0, 5) ?? '',
            end_time: s.end_time?.slice(0, 5) ?? '',
            user_id: s.user?.id ?? '',
            project_id: s.project?.id ?? '',
            type: s.type,
        }))
    );

    const [editingRowId, setEditingRowId] = useState<number | null>(null);

    const sheetInputClasses =
        "w-full border-none bg-transparent px-1 py-0.5 text-[11px] text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary/40";
    const cellTextClasses =
        "block px-1 py-0.5 text-[11px] font-medium text-neutral-900 dark:text-neutral-100";
    const filterFieldClasses =
        "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

    const findUserName = (id: number | '') => {
        if (!id) return '—';
        return users.find(u => u.id === Number(id))?.name ?? '—';
    };

    const findProjectName = (id: number | '') => {
        if (!id) return '—';
        return projects.find(p => p.id === Number(id))?.name ?? '—';
    };

    const saveRow = async (row: EditableShift) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = {
            ...row,
            user_id: row.user_id === '' ? null : Number(row.user_id),
            project_id: row.project_id === '' ? null : Number(row.project_id),
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
            return true;
        }
        toast.error(data.message);
        return false;
    };

    const handleChange = (rowId: number, field: keyof EditableShift, value: any) => {
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
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

    const activateRowEditing = (rowId: number) => setEditingRowId(rowId);

    const [form, setForm] = useState({
        date: '',
        start_time: '',
        end_time: '',
        type: ShiftType.FD,
        user_id: '',
        project_id: ''
    });

    const saveNewShift = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const payload = {
            ...form,
            user_id: form.user_id === '' ? null : Number(form.user_id),
            project_id: form.project_id === '' ? null : Number(form.project_id),
            start_time: form.start_time ? form.start_time + ":00" : null,
            end_time: form.end_time ? form.end_time + ":00" : null,
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
            const formattedRow: EditableShift = {
                id: data.shift.id,
                date: data.shift.date ? new Date(data.shift.date).toISOString().split('T')[0] : '',
                start_time: data.shift.start_time?.slice(0, 5) ?? '',
                end_time: data.shift.end_time?.slice(0, 5) ?? '',
                user_id: data.shift.user_id ?? '',
                project_id: data.shift.project_id ?? '',
                type: data.shift.type,
            };

            const getDateValue = (value: string) => value ? new Date(value).getTime() : 0;
            setRows(prev => [...prev, formattedRow].sort((a, b) => getDateValue(a.date) - getDateValue(b.date)));

            setForm({
                date: '',
                start_time: '',
                end_time: '',
                type: ShiftType.FD,
                user_id: '',
                project_id: ''
            });
            toast.success('Shift created successfully');
        } else {
            toast.error(data.message);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Shifts" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <Calendar className="h-5 w-5" />
                                Shifts
                            </h1>

                            <button
                                onClick={scrollToBottom}
                                className="ml-auto border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                            >
                                ↓ Go to bottom
                            </button>
                        </div>

                        <div className="mb-2 space-y-2 border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">

                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filters</h2>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Date Start</label>
                                    <input
                                        type="date"
                                        value={filterState.dateStart || ""}
                                        onChange={e => updateFilter("dateStart", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Date End</label>
                                    <input
                                        type="date"
                                        value={filterState.dateEnd || ""}
                                        onChange={e => updateFilter("dateEnd", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>

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
                                        <option value="all_shifts">ALL</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Status</label>
                                    <select
                                        value={filterState.status || ""}
                                        onChange={e => updateFilter("status", e.target.value)}
                                        className={filterFieldClasses}
                                    >
                                        <option value="">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
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
                                    onClick={() => router.visit('/shifts')}
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
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Start</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">End</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Type</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">User</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Project</th>
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
                                                <input
                                                    type="time"
                                                    value={row.start_time}
                                                    onChange={e => handleChange(row.id, "start_time", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{row.start_time || '—'}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="time"
                                                    value={row.end_time}
                                                    onChange={e => handleChange(row.id, "end_time", e.target.value)}
                                                    className={sheetInputClasses}
                                                />
                                            ) : (
                                                <span className={cellTextClasses}>{row.end_time || '—'}</span>
                                            )}
                                        </td>

                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            {editingRowId === row.id ? (
                                                <select
                                                    value={row.type}
                                                    onChange={e => handleChange(row.id, "type", e.target.value as ShiftType)}
                                                    className={sheetInputClasses}
                                                >
                                                    {Object.entries(ShiftTypeSettings).map(([key, val]) => (
                                                        <option key={key} value={key}>{val.label}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={cellTextClasses}>{ShiftTypeSettings[row.type]?.label || row.type}</span>
                                            )}
                                        </td>

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
                                        <input
                                            type="time"
                                            value={form.start_time}
                                            onChange={e => setForm({ ...form, start_time: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>

                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <input
                                            type="time"
                                            value={form.end_time}
                                            onChange={e => setForm({ ...form, end_time: e.target.value })}
                                            className={sheetInputClasses}
                                        />
                                    </td>

                                    <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value as ShiftType })}
                                            className={sheetInputClasses}
                                        >
                                            {Object.entries(ShiftTypeSettings).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                    </td>

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
                                            onClick={saveNewShift}
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
