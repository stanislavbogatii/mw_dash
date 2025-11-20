import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Users } from 'lucide-react';
import { useState } from 'react';

type Role = { id: number; name: string };
type User = { id: number; name: string; email: string; username: string; roles: Role[] };

type Filters = {
    search?: string;
    roles?: number[];
};

type Props = {
    users: User[];
    roles: Role[];
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/admin/users' },
];

export default function UsersIndex({ users, roles, filters }: Props) {

    // Инициализируем фильтры (превращаем string[] в number[])
    const [filterState, setFilterState] = useState<Filters>({
        search: filters.search ?? "",
        roles: Array.isArray(filters.roles)
            ? filters.roles.map(id => Number(id))
            : [],
    });

    const updateFilter = (key: keyof Filters, value: any) => {
        setFilterState(prev => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        router.get('/admin/users', {
            search: filterState.search || undefined,
            roles: filterState.roles?.length ? filterState.roles : undefined,
        }, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const resetFilters = () => {
        setFilterState({ search: "", roles: [] });

        router.get('/admin/users', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex flex-col gap-4 h-full p-4">

                <div className="border rounded-xl bg-white dark:bg-neutral-900 p-6">

                    {/* Header */}
                    <div className="flex mb-6">
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Users
                        </h1>

                        <div className="ml-auto">
                            <Link
                                href="/admin/users/create"
                                className="px-3 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm"
                            >
                                + Create User
                            </Link>
                        </div>
                    </div>

                    {/* FILTER PANEL */}
                    <div className="border rounded-lg p-4 bg-neutral-50 dark:bg-neutral-800 mb-6 space-y-4">
                        <h2 className="font-semibold text-lg">Filters</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                            {/* SEARCH */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Name, email, username</label>
                                <input
                                    type="text"
                                    value={filterState.search ?? ""}
                                    onChange={e => updateFilter("search", e.target.value)}
                                    className="border rounded px-2 py-1 bg-white dark:bg-neutral-900"
                                />
                            </div>

                            {/* ROLES AS TOGGLE BUTTONS */}
                            <div className="flex flex-col">
                                <label className="text-sm font-medium mb-1">Roles</label>

                                <div className="flex flex-wrap gap-2">

                                    {roles.map(role => {
                                        const isActive = filterState.roles?.includes(role.id);

                                        return (
                                            <button
                                                key={role.id}
                                                type="button"
                                                onClick={() => {
                                                    let updated = filterState.roles ?? [];

                                                    updated = isActive
                                                        ? updated.filter(id => id !== role.id) 
                                                        : [...updated, role.id];              

                                                    updateFilter("roles", updated);
                                                }}
                                                className={`px-3 py-1 rounded-md border text-sm transition
                                                    ${isActive
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-white dark:bg-neutral-900 border-neutral-400 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    }
                                                `}
                                            >
                                                {role.name}
                                            </button>
                                        );
                                    })}

                                </div>
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
                                onClick={resetFilters}
                                className="px-4 py-2 bg-neutral-300 dark:bg-neutral-700 rounded hover:opacity-70"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* USERS TABLE */}
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
                                <tr key={user.id} className="border-t border-neutral-300 dark:border-neutral-800">
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
        </AppLayout>
    );
}
