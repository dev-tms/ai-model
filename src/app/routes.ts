import { History, LayoutDashboard, LucideIcon } from 'lucide-react';

export type AppRouteId = 'dashboard' | 'conversations';

export type AppRoute = {
  id: AppRouteId;
  label: string;
  path: string;
  icon: LucideIcon;
};

export const appRoutes: AppRoute[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
  },
  {
    id: 'conversations',
    label: 'Conversations',
    path: '/conversations',
    icon: History,
  },
];

export const defaultRoute = appRoutes[0];

export const getRouteByPath = (pathname: string): AppRoute =>
  appRoutes.find(route => route.path === pathname) ?? defaultRoute;
