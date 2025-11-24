import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Users, ShieldCheck, Lock, Calendar, Gift, DollarSign } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
        roles: ['owner']
    },
    {
        title: 'Projects',
        href: '/projects',
        icon: Folder,
        roles: ['owner']
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: ShieldCheck,
        roles: ['owner']
    },
    {
        title: 'Deposits',
        href: '/deposits',
        
        icon: DollarSign,
        roles: ['owner']
    },
    {
        title: 'Sales shifts',
        href: '/shifts',
        icon: Calendar,
        roles: ['owner']
    },
    {
        title: 'Commissions',
        href: '/commissions',
        icon: BookOpen,
        roles: ['owner']

    },
    {
        title: 'Currencies',
        href: '/currencies',
        icon: BookOpen,
        roles: ['owner']

    },
    {
        title: 'Fines',
        href: '/fines',
        icon: BookOpen,
        roles: ['owner']

    },
    {
        title: 'KPI',
        href: '/kpi',
        icon: BookOpen,
        roles: ['owner']

    },
    {
        title: 'Spend',
        href: '/spend',
        icon: BookOpen,
        roles: ['owner']

    },
    {
        title: 'Bonus',
        href: '/bonus',
        icon: Gift,
        roles: ['owner']

    },
    {
        title: 'Salary schemes',
        href: '/salary-scheme',
        icon: DollarSign,
        roles: ['owner']
    },
    {
        title: 'My sales',
        href: '/my-sales',
        icon: DollarSign,
        roles: ['sales_manager', 'owner']
    },
    {
        title: 'My spends',
        href: '/my-spends',
        icon: Lock,
        roles: ['buyier', 'owner']
    }
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
