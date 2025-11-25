import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import { Users } from 'lucide-react';
import { useRef, useState } from 'react';

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
    const bottomRef = useRef<HTMLDivElement | null>(null);

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

    const ghostButtonClasses =
        "border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
    const primaryButtonClasses =
        "border border-primary bg-primary/90 px-3 py-1 text-xs text-white hover:bg-primary dark:border-primary dark:text-neutral-900";
    const secondaryButtonClasses =
        "border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200";
    const filterFieldClasses =
        "w-full border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-800 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="flex h-full flex-1 flex-col gap-2 overflow-x-auto p-2">
                <div className="relative min-h-[400px] border border-neutral-200 dark:border-sidebar-border bg-white dark:bg-neutral-900">
                    <div className="relative p-3 space-y-4">

                        <div className="flex items-center gap-2">
                            <h1 className="flex items-center gap-1 text-lg font-semibold">
                                <Users className="h-5 w-5" />
                                Users
                            </h1>
                            <Link
                                href="/admin/users/create"
                                className="border border-primary bg-primary px-3 py-1 text-xs text-white hover:opacity-90 dark:text-neutral-900"
                            >
                                + Create User
                            </Link>
                            <button
                                onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
                                className={`ml-auto ${ghostButtonClasses}`}
                            >
                                ↓ Go to bottom
                            </button>
                        </div>

                        <div className="mb-2 space-y-2 border border-neutral-200 bg-white p-3 text-xs dark:border-neutral-800 dark:bg-neutral-900">
                            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Filters</h2>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Search</label>
                                    <input
                                        type="text"
                                        placeholder="Name, email, username"
                                        value={filterState.search ?? ""}
                                        onChange={e => updateFilter("search", e.target.value)}
                                        className={filterFieldClasses}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 sm:col-span-2">
                                    <label className="text-[10px] uppercase text-neutral-500 dark:text-neutral-400">Roles</label>
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
                                                    className={`px-3 py-1 border text-xs transition ${
                                                        isActive
                                                            ? "bg-primary text-white border-primary"
                                                            : "bg-white dark:bg-neutral-900 border-neutral-400 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    }`}
                                                >
                                                    {role.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1 text-xs">
                                <button
                                    onClick={applyFilters}
                                    className={primaryButtonClasses}
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={resetFilters}
                                    className={secondaryButtonClasses}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <table className="w-full border border-neutral-200 border-collapse text-[11px] dark:border-neutral-800">
                            <thead>
                                <tr className="bg-neutral-50 text-[10px] uppercase tracking-wide text-neutral-500 dark:bg-neutral-900/60 dark:text-neutral-400">
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Name</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Username</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Email</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-left font-semibold dark:border-neutral-800">Roles</th>
                                    <th className="border border-neutral-200 px-1 py-1 text-right font-semibold dark:border-neutral-800">Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <span className="block px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100">{user.name}</span>
                                        </td>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <span className="block px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100">{user.username}</span>
                                        </td>
                                        <td className="border border-neutral-200 p-0 dark.border-neutral-800">
                                            <span className="block px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100">{user.email}</span>
                                        </td>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <span className="block px-2 py-1 text-[11px] text-neutral-800 dark:text-neutral-100">
                                                {user.roles.length ? user.roles.map(r => r.name).join(', ') : 'No roles'}
                                            </span>
                                        </td>
                                        <td className="border border-neutral-200 p-0 dark:border-neutral-800">
                                            <Link
                                                href={`/admin/users/${user.id}/edit`}
                                                className="flex h-full w-full items-center justify-center bg-primary/80 px-2 py-1 text-[10px] uppercase tracking-wide text-white hover:bg-primary dark:text-neutral-900"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex w-full pt-2" ref={bottomRef}>
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className={`ml-auto ${ghostButtonClasses}`}
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
