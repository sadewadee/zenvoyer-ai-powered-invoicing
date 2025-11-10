import {
  LayoutDashboard, FileText, Users, Package, BarChart2,
  Settings, LifeBuoy, Shield, Users as TeamIcon
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole, Permission } from '@/types';
export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission;
}
export interface NavGroup {
  title?: string;
  items: NavItem[];
}
const userNav: NavItem[] = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, requiredPermission: 'dashboard:view' },
  { name: 'Invoices', href: '/app/invoices', icon: FileText, requiredPermission: 'invoices:view' },
  { name: 'Clients', href: '/app/clients', icon: Users, requiredPermission: 'clients:view' },
  { name: 'Products', href: '/app/products', icon: Package, requiredPermission: 'products:view' },
  { name: 'Reports', href: '/app/reports', icon: BarChart2, requiredPermission: 'reports:view' },
];
const adminNav: NavItem[] = [
  { name: 'Support Dashboard', href: '/admin/support', icon: LifeBuoy, requiredRole: ['ADMIN', 'SUPER_ADMIN'], requiredPermission: 'admin:support' },
];
const superAdminNav: NavItem[] = [
  { name: 'User Management', href: '/admin/super', icon: Shield, requiredRole: 'SUPER_ADMIN', requiredPermission: 'admin:super' },
];
const settingsNav: NavItem[] = [
  { name: 'Settings', href: '/app/settings', icon: Settings, requiredPermission: 'settings:view' },
];
export const navigationConfig: NavGroup[] = [
  {
    items: userNav,
  },
  {
    title: 'Admin',
    items: [...adminNav, ...superAdminNav],
  },
  {
    title: 'Account',
    items: settingsNav,
  },
];