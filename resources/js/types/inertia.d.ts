/// <reference types="@inertiajs/react" />
import { PageProps as InertiaPageProps } from '@inertiajs/core';

declare module '@inertiajs/react' {
    export interface PageProps extends InertiaPageProps {
        auth: {
            user: {
                id: number;
                name: string;
                email: string;
                username: string;
                roles: { id: number; name: string }[];
            } | null;
        };

        name?: string;
        sidebarOpen?: boolean;
    }
}
