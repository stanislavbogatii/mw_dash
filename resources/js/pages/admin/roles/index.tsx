import AppLayout from '@/layouts/app-layout';
import { useForm, Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { KeyRound } from 'lucide-react';

type Role = { id: number; name: string };

type Props = {
    roles: Role[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Roles', href: '/admin/roles' },
];

export default function RolesIndex({ roles }: Props) {
    const { data, setData, post, processing, reset } =
        useForm<{ name: string }>({ name: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/roles', { onSuccess: () => reset('name') });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/10" /> */}

                    <div className="relative p-6 space-y-6">

                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <KeyRound className="w-6 h-6" />
                            Roles
                        </h1>

                        {/* Add Role */}
                        <form onSubmit={submit} className="flex gap-2">
                            <input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="flex-1 border rounded px-3 py-2 text-sm"
                                placeholder="New role name (admin, manager...)"
                            />
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                            >
                                Add
                            </button>
                        </form>

                        {/* Roles list */}
                        <div className="border rounded divide-y text-sm bg-white/70 dark:bg-neutral-900/60">
                            {roles.map(role => (
                                <div
                                    key={role.id}
                                    className="px-4 py-3 flex items-center justify-between"
                                >
                                    <span>{role.name}</span>
                                </div>
                            ))}
                        </div>

                    </div>

                </div>

            </div>
        </AppLayout>
    );
}
