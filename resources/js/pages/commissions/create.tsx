import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Plus } from 'lucide-react';

type Project = { id: number; name: string };

type Props = {
    projects: Project[];
};

export default function CommissionCreate({ projects }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Commissions', href: '/commissions' },
        { title: 'Create Commission', href: '/commissions/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        amount: 0,
        order: 0,
        project_id: 0
    });


    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/commissions');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Commission" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/10" /> */}

                    <form onSubmit={submit} className="relative p-6 space-y-6">
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Plus className="w-6 h-6" />
                            Create Commission
                        </h1>
                        
                        {/* Name */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Name</label>
                            <input
                                className="w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                        </div>

                        {/* Amount */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Amount</label>
                            <input
                                type="number"
                                min={0}
                                step={1}
                                className="w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
                                value={data.amount}
                                onChange={(e) => setData('amount', +e.target.value)}
                            />
                            {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                        </div>

                        {/* PROJECT */}
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Project</label>
                            <select
                                value={data.project_id}
                                onChange={(e) => setData('project_id', +e.target.value)}
                                className="w-full rounded border border-neutral-300 dark:border-sidebar-border bg-white dark:bg-neutral-900 px-2 py-1"
                            >
                                <option value="">-</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                            Create
                        </button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
