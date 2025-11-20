import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar, Minimize } from 'lucide-react';
import toast from 'react-hot-toast';


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
    percent: { label: "percent", classes: "!bg-yellow-400" },
    amount: { label: "amount", classes: "!bg-red-400" },
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
    date: Date;
    value: number;
    type: SalarySchemeTypeEnum,
    min?: number;
    max?: number;
    position_type: SalarySchemePositionTypeEnum;
    value_type: SalarySchemeValueTypeEnum;
    project_id: number;
    user_id?: number;
}

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


    const [rows, setRows] = useState(() => 
        salarySchemes.map(k => ({
            ...k,
            date: new Date(k.date),
            id: k.id,
            type: k.type,
            value_type: k.value_type,
            position_type: k.position_type,
            value: k.value,
            min: k.min,
            max: k.max,
            project: projects.find(p => p.id === k.project_id),
            project_id: k.project_id,
            user_id: k.user_id,
            user: users.find(u => u.id === k.user_id)
        }))
    );


    const saveRow = async (row: SalaryScheme) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch(`/api/salaryScheme/${row.id}`, {
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
            toast.success('SalaryScheme updated successfully');
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

        const response = await fetch('/api/salaryScheme', {
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
                    ...data.salaryScheme,
                    date: data.salaryScheme.date,
                    project_id: data.salaryScheme.project_id,
                    user_id: data.salaryScheme.user_id,
                    value: data.salaryScheme.value,
                    type: data.salaryScheme.type,
                    value_type: data.salaryScheme.value_type,
                    position_type: data.salaryScheme.position_type,
                    min: data.salaryScheme.min,
                    max: data.salaryScheme.max,
                },
                ...rows
            ]

            setRows(newRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

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
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SalaryScheme" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                SalaryScheme
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
                                    onClick={() => router.visit('/salaryScheme')}
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
                                    <th className="px-3 py-2 text-left">Project</th>
                                    <th className="px-3 py-2 text-left">User</th>
                                    <th className="px-3 py-2 text-left">Value</th>
                                    <th className="px-3 py-2 text-left">Type</th>
                                    <th className="px-3 py-2 text-left">Position type</th>
                                    <th className="px-3 py-2 text-left">Value type</th>
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

                                        {/* VALUE */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={row.value}
                                                onChange={e => handleChange(row.id, "value", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* TYPE */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.type}
                                                onChange={e => handleChange(row.id, "type", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                <option value="FIX">FIX</option>
                                                <option value="PER_DEPOSIT">PER_DEPOSIT</option>
                                                <option value="PER_INCOME">PER_INCOME</option>
                                                <option value="FROM_SPEND">FROM_SPEND</option>
                                                <option value="FROM_TOTAL_PROFIT">FROM_TOTAL_PROFIT</option>
                                                <option value="FROM_TOTAL_INCOME">FROM_TOTAL_INCOME</option>
                                            </select>
                                        </td>

                                        {/* POSITION TYPE */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.position_type}
                                                onChange={e => handleChange(row.id, "position_type", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                <option value="FD">FD</option>
                                                <option value="RD">RD</option>
                                                <option value="ALL">ALL</option>
                                                <option value="BUYING">BUYING</option>
                                                <option value="PERSONAL">PERSONAL</option>
                                            </select>
                                        </td>

                                        {/* VALUE TYPE */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.value_type}
                                                onChange={e => handleChange(row.id, "value_type", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                <option value="percent">Percent</option>
                                                <option value="amount">Amount</option>
                                            </select>
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
                                        <input
                                            type="number"
                                            value={form.value}
                                            onChange={e => setForm({ ...form, value: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.type}
                                            onChange={e => setForm({ ...form, type: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            <option value="FIX">FIX</option>
                                            <option value="PER_DEPOSIT">PER_DEPOSIT</option>
                                            <option value="PER_INCOME">PER_INCOME</option>
                                            <option value="FROM_SPEND">FROM_SPEND</option>
                                            <option value="FROM_TOTAL_PROFIT">FROM_TOTAL_PROFIT</option>
                                            <option value="FROM_TOTAL_INCOME">FROM_TOTAL_INCOME</option>
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.position_type}
                                            onChange={e => setForm({ ...form, position_type: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            <option value="FD">FD</option>
                                            <option value="RD">RD</option>
                                            <option value="ALL">ALL</option>
                                            <option value="BUYING">BUYING</option>
                                            <option value="PERSONAL">PERSONAL</option>
                                        </select>
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.value_type}
                                            onChange={e => setForm({ ...form, value_type: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            <option value="percent">Percent</option>
                                            <option value="amount">Amount</option>
                                        </select>
                                    </td>



                                    
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={saveNewSalaryScheme}
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
