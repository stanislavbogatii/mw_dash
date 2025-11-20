import { usePage } from '@inertiajs/react';
import type { PageProps } from "@inertiajs/react";

type Role = {
    name: string;
    id: number;
}

export function useRoles() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    const hasRole = (role: string) =>
        user?.roles?.some(r => r.name === role);

    const hasAnyRole = (roles: string[] | null) => {
        if (!roles) return true
        return user?.roles?.some(r => roles.includes(r.name));
    }

    return { user, hasRole, hasAnyRole };
}
