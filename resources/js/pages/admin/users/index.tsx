import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import { Users } from 'lucide-react';

type Role = { id: number; name: string };
type User = { id: number; name: string; email: string; username: string, roles: Role[] };

type Props = {
    users: User[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/admin/users' },
];

export default function UsersIndex({ users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    {/* <div className="absolute inset-0">
                        <PlaceholderPattern className="size-full stroke-neutral-900/25 dark:stroke-neutral-100/10" />
                    </div> */}

                    <div className="relative p-6 space-y-6">
                      <div className='flex'>
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Users
                        </h1>

                        <div className="ml-auto">
                            <Link
                                className="px-3 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm"
                                href="/admin/users/create"
                            >
                                + Create User
                            </Link>
                        </div>
                      </div>

                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-neutral-100 dark:bg-neutral-800">
                                    <th className="px-3 py-2 text-left">Name</th>
                                    <th className="px-3 py-2 text-left">Username</th>
                                    <th className="px-3 py-2 text-left">Email</th>
                                    <th className="px-3 py-2 text-left">Roles</th>
                                    <th className="px-3 py-2 text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr
                                        key={user.id}
                                        className="border-t border-neutral-300 dark:border-neutral-800"
                                    >
                                        <td className="px-3 py-2">{user.name}</td>
                                        <td className="px-3 py-2">{user.username}</td>
                                        <td className="px-3 py-2">{user.email}</td>
                                        <td className="px-3 py-2">
                                            {user.roles.length
                                                ? user.roles.map(r => r.name).join(', ')
                                                : <span className="text-neutral-500">no roles</span>}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="text-primary hover:underline"
                                            >
                                                Edit →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
