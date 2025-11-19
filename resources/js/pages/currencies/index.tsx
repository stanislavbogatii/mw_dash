import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

type Project = { id: number; name: string; currency_code: string; };

type Filters = {
    dateStart?: string;
    dateEnd?: string;
    name?: string;
    project_id?: string;
};

type Currency = {
    date: Date;
    id: number;
    name: string;
    amount: number;
    project_id: number;
    project: Project;
}

type Props = {
    projects: Project[];
    filters: Filters;
    currencies: Currency[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Currencies', href: '/currencies' },
];

export default function CurrencyIndex({ currencies, projects, filters }: Props) {
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
        name: filters.name || "",
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

        router.visit(`/currencies?${params.toString()}`, {
            preserveScroll: true,
            preserveState: false,
        });
    };


    const [rows, setRows] = useState(() => 
        currencies.map(s => ({
            ...s,
            date: new Date(s.date),
            id: s.id,
            name: s.name,
            amount: s.amount,
            project_id: s.project_id,
            project: s.project
        }))
    );


    const saveRow = async (row: Currency) => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch(`/api/currencies/${row.id}`, {
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
            toast.success('Currency updated successfully');
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

    // new currency form
    const [form, setForm] = useState({
        date: '',
        code: '',
        amount: 0,
        name: '',
        project_id: ''
    });

    const saveNewCurrency = async () => {
        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

        const response = await fetch('/api/currencies', {
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
                    ...data.currency,
                    date: data.currency.date,
                    code: data.currency.code,
                    amount: data.currency.amount,
                    project_id: data.currency.project_id,
                },
                ...rows
            ]

            setRows(newRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

            setForm({
                date: '',
                code: '',
                amount: 0,
                name: '',
                project_id: ''
            });
            toast.success('Currency created successfully');
        }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Currencies" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-6 space-y-6">

                        <div className="flex">
                            <h1 className="text-2xl font-semibold flex items-center gap-2">
                                <Calendar className="w-6 h-6" />
                                Currencies
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


                                {/* NAME */}
                                {/* <div className="flex flex-col">
                                    <label className="text-sm font-medium mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={filterState.name || ""}
                                        onChange={e => updateFilter("name", e.target.value)}
                                        className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                    />
                                </div> */}

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
                                            <option key={p.id} value={p.id}>{p.name} ({p.currency_code})</option>
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
                                    onClick={() => router.visit('/currencies')}
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
                                    {/* <th className="px-3 py-2 text-left">Code</th> */}
                                    <th className="px-3 py-2 text-left">Amount</th>
                                    {/* <th className="px-3 py-2 text-left">Name</th> */}
                                    <th className="px-3 py-2 text-left">Project</th>
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

                                        {/* CODE */}
                                        {/* <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={row.code}
                                                onChange={e => handleChange(row.id, "code", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td> */}

                                        {/* AMOUNT */}
                                        <td className="px-3 py-2">
                                            <input
                                                type="number"
                                                value={+row.amount}
                                                onChange={e => handleChange(row.id, "amount", +e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td>

                                        {/* Name */}
                                        {/* <td className="px-3 py-2">
                                            <input
                                                type="text"
                                                value={row.name}
                                                onChange={e => handleChange(row.id, "name", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            />
                                        </td> */}

                                        {/* PROJECT */}
                                        <td className="px-3 py-2">
                                            <select
                                                value={row.project_id}
                                                onChange={e => handleChange(row.id, "project_id", e.target.value)}
                                                className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                                            >
                                                <option value="">-</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.currency_code})</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td></td>
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

                                    {/* <td className="px-3 py-2">
                                        <input
                                            type="text"
                                            value={form.code}
                                            onChange={e => setForm({ ...form, code: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td> */}

                                    <td className="px-3 py-2">
                                        <input
                                            type="number"
                                            value={form.amount}
                                            onChange={e => setForm({ ...form, amount: +e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td>

                                    {/* <td className="px-3 py-2 flex gap-2">
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        />
                                    </td> */}

                                    <td className="px-3 py-2">
                                        <select
                                            value={form.project_id}
                                            onChange={e => setForm({ ...form, project_id: e.target.value })}
                                            className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                                        >
                                            <option value="">-</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.currency_code})</option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={saveNewCurrency}
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
