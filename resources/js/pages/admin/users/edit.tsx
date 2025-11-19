import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { type BreadcrumbItem } from '@/types';
import { UserCog } from 'lucide-react';

type Role = { id: number; name: string };
type User = { id: number; name: string; email: string; roles: Role[], username: string };

type Props = {
    user: User;
    roles: Role[];
};

export default function UserEdit({ user, roles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/admin/users' },
        { title: `Edit: ${user.name}`, href: `/admin/users/${user.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        username: user.username,
        password: '',
        roles: user.roles.map((r) => r.name),
    });

    const toggleRole = (roleName: string) => {
        setData(
            'roles',
            data.roles.includes(roleName)
                ? data.roles.filter((r) => r !== roleName)
                : [...data.roles, roleName]
        );
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="relative min-h-[350px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    {/* <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/10" /> */}

                    <form onSubmit={submit} className="relative p-6 space-y-6">

                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <UserCog className="w-6 h-6" />
                            Edit User
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

                        {/* Email */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                className="w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                        </div>

                        {/* Username */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Username</label>
                            <input
                                className="w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                            />
                            {errors.username && <p className="text-red-500 text-xs">{errors.username}</p>}
                        </div>

                        {/* Password (optional) */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">New Password (optional)</label>
                            <input
                                type="password"
                                className="w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700"
                                placeholder="Leave empty to keep current"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                        </div>

                        {/* Roles */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Roles</label>

                            <div className="grid gap-2">
                                {roles.map((role) => (
                                    <label
                                        key={role.id}
                                        className="flex items-center gap-2 text-sm cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data.roles.includes(role.name)}
                                            onChange={() => toggleRole(role.name)}
                                        />
                                        {role.name}
                                    </label>
                                ))}
                            </div>
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
