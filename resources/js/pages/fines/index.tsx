import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { Calendar, Check, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

enum FineType {
    FD = 'FD',
    RD = 'RD',
    BUYING = 'BUYING',
    OTHER = 'OTHER',
}

const FineTypeSettings = {
    FD: { label: "FD", classes: "!bg-yellow-400" },
    RD: { label: "RD", classes: "!bg-red-400" },
    BUYING: { label: "BUYING", classes: "!bg-blue-400" },
    OTHER: { label: "OTHER", classes: "!bg-gray-400" },
} as const;

 type Project = { id: number; name: string };

 type Filters = {
     dateStart?: string;
     dateEnd?: string;
     user_id?: string;
     type?: FineType;
     project_id?: string;
 };

 type Fine = {
     id: number;
     date: string;
     amount: number;
     project_id: number | null;
     user_id: number | null;
     type: FineType;
 };

 type EditableFine = {
     id: number;
     date: string;
     amount: string;
     project_id: number | '';
     user_id: number | '';
     type: FineType;
 };

 type User = {
     id: number;
     name: string;
 }

 type Props = {
     projects: Project[];
     filters: Filters;
     fines: Fine[];
     users: User[]
 };

 const breadcrumbs: BreadcrumbItem[] = [
     { title: 'Fines', href: '/fines' },
 ];

 const numberFromString = (value: string) => {
     if (value === '' || value === null || value === undefined) return null;
     const parsed = Number(value);
     return Number.isFinite(parsed) ? parsed : null;
 };

 export default function FinesIndex({ fines, projects, users, filters }: Props) {
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
         type: filters.type || "",
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

         router.visit(`/fines?${params.toString()}`, {
             preserveScroll: true,
             preserveState: false,
         });
     };

     const [rows, setRows] = useState<EditableFine[]>(() =>
         fines.map(item => ({
             id: item.id,
             date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
             amount: item.amount?.toString() ?? '',
             project_id: item.project_id ?? '',
             user_id: item.user_id ?? '',
             type: item.type,
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

     const saveRow = async (row: EditableFine) => {
         const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

         const payload = {
             ...row,
             project_id: row.project_id === '' ? null : Number(row.project_id),
             user_id: row.user_id === '' ? null : Number(row.user_id),
             amount: numberFromString(row.amount),
         };

         const response = await fetch(`/api/fines/${row.id}`, {
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
             toast.success('Fine updated successfully');
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

     const handleChange = (rowId: number, field: keyof EditableFine, value: any) => {
         setRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
     };

     const toggleRowEditing = (rowId: number) => {
         setEditingRowId(prev => (prev === rowId ? null : rowId));
     };

     const activateRowEditing = (rowId: number) => setEditingRowId(rowId);

     const [form, setForm] = useState({
         date: '',
         user_id: '',
         type: FineType.FD,
         amount: '',
         project_id: ''
     });

     const saveNewFine = async () => {
         const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

         const payload = {
             ...form,
             user_id: form.user_id === '' ? null : Number(form.user_id),
             project_id: form.project_id === '' ? null : Number(form.project_id),
             amount: numberFromString(form.amount),
         };

         const response = await fetch('/api/fines', {
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
             const formattedRow: EditableFine = {
                 id: data.fine.id,
                 date: data.fine.date ? new Date(data.fine.date).toISOString().split('T')[0] : '',
                 user_id: data.fine.user_id ?? '',
                 type: data.fine.type,
                 amount: data.fine.amount?.toString() ?? '',
                 project_id: data.fine.project_id ?? ''
             };

             const getDateValue = (value: string) => value ? new Date(value).getTime() : 0;
             setRows(prev => [...prev, formattedRow].sort((a, b) => getDateValue(a.date) - getDateValue(b.date)));

             setForm({
                 date: '',
                 user_id: '',
                 type: FineType.FD,
                 amount: '',
                 project_id: ''
             });
             toast.success('Fine created successfully');
         } else {
             toast.error(data.message);
         }
     };

     const totals = useMemo(() => {
         return rows.reduce((acc, row) => acc + (Number(row.amount) || 0), 0);
     }, [rows]);

     return (
         <AppLayout breadcrumbs={breadcrumbs}>
             <Head title="Fines" />

             <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                 <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                     <div className="relative p-3 space-y-4">

                         <div className="flex items-center gap-2">
                             <h1 className="flex items-center gap-1 text-lg font-semibold">
                                 <Calendar className="h-5 w-5" />
                                 Fines
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
                                         {Object.entries(FineTypeSettings).map(([key, val]) => (
                                             <option key={key} value={key}>{val.label}</option>
                                         ))}
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
                                     onClick={() => router.visit('/fines')}
                                     className="border border-neutral-300 bg-white px-3 py-1 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
                                 >
                                     Reset
                                 </button>
                             </div>
                         </div>

                         <div className="border border-neutral-200 bg-white p-3 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200">
                             <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Statistics</h2>
                             <div className="mt-2 text-[11px] font-semibold">
                                 Total fines: {rows.length} / Amount: {totals.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                             </div>
                         </div>

                         <table className="w-full border border-neutral-200 border-collapse text-[11px] dark:border-neutral-800">
                             <thead>
                                 <tr className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                     <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Edit</th>
                                     <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Date</th>
                                     <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Amount</th>
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
                                                     type="number"
                                                     value={row.amount}
                                                     onChange={e => handleChange(row.id, "amount", e.target.value)}
                                                     className={sheetInputClasses}
                                                 />
                                             ) : (
                                                 <span className={cellTextClasses}>{row.amount || '—'}</span>
                                             )}
                                         </td>

                                         <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                             {editingRowId === row.id ? (
                                                 <select
                                                     value={row.type}
                                                     onChange={e => handleChange(row.id, "type", e.target.value as FineType)}
                                                     className={sheetInputClasses}
                                                 >
                                                     {Object.entries(FineTypeSettings).map(([key, val]) => (
                                                         <option key={key} value={key}>{val.label}</option>
                                                     ))}
                                                 </select>
                                             ) : (
                                                 <span className={cellTextClasses}>{FineTypeSettings[row.type]?.label || row.type}</span>
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
                                             type="number"
                                             value={form.amount}
                                             onChange={e => setForm({ ...form, amount: e.target.value })}
                                             className={sheetInputClasses}
                                         />
                                     </td>

                                     <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                         <select
                                             value={form.type}
                                             onChange={e => setForm({ ...form, type: e.target.value as FineType })}
                                             className={sheetInputClasses}
                                         >
                                             {Object.entries(FineTypeSettings).map(([key, val]) => (
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
                                             onClick={saveNewFine}
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
