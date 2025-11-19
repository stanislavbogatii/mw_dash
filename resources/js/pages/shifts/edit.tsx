import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { type BreadcrumbItem } from '@/types';
import { UserCog } from 'lucide-react';

type Project = { id: number; name: string; };

type Props = {
    project: Project;
};

export default function ProjectEdit({ project }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Projects', href: '/projects' },
        { title: `Edit: ${project.name}`, href: `/projects/${project.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: project.name,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/projects/${project.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${project.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/10" /> */}

                    <form onSubmit={submit} className="relative p-6 space-y-6">

                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <UserCog className="w-6 h-6" />
                            Edit Project
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

                        {/* Save button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                            Save Changes
                        </button>

                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
