import {
  LayoutDashboard, FileText, Users, Package, BarChart2,
  Settings, LifeBuoy, Shield, SlidersHorizontal
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { UserRole, Permission } from '@/types';
import type { User } from './auth';
export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission;
  businessStage?: 'new' | 'intermediate' | 'advanced';
}
export interface NavGroup {
  title?: string;
  items: NavItem[];
}
const ALL_NAV_ITEMS: Record<string, NavItem> = {
  dashboard: { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, requiredPermission: 'dashboard:view' },
  invoices: { name: 'Invoices', href: '/app/invoices', icon: FileText, requiredPermission: 'invoices:view' },
  clients: { name: 'Clients', href: '/app/clients', icon: Users, requiredPermission: 'clients:view' },
  products: { name: 'Products', href: '/app/products', icon: Package, requiredPermission: 'products:view' },
  reports: { name: 'Reports', href: '/app/reports', icon: BarChart2, requiredPermission: 'reports:view' },
  settings: { name: 'Settings', href: '/app/settings', icon: Settings, requiredPermission: 'settings:view' },
  support: { name: 'Support Dashboard', href: '/admin/support', icon: LifeBuoy, requiredRole: ['ADMIN', 'SUPER_ADMIN'], requiredPermission: 'admin:support' },
  userManagement: { name: 'User Management', href: '/admin/super', icon: Shield, requiredRole: 'SUPER_ADMIN', requiredPermission: 'admin:super' },
  platformSettings: { name: 'Platform Settings', href: '/admin/platform-settings', icon: SlidersHorizontal, requiredRole: 'SUPER_ADMIN', requiredPermission: 'admin:super' },
};
export function generateNavigation(user: User | null, permissions: Set<Permission>): NavGroup[] {
  if (!user) return [];
  const isVisible = (item: NavItem) => {
    const roleCheck = item.requiredRole ? (Array.isArray(item.requiredRole) ? item.requiredRole.includes(user.role) : item.requiredRole === user.role) : true;
    const permCheck = item.requiredPermission ? permissions.has(item.requiredPermission) : true;
    const stageCheck = item.businessStage ? item.businessStage === user.businessStage : true;
    return roleCheck && permCheck && stageCheck;
  };
  const filterItems = (itemKeys: string[]) => itemKeys.map(key => ALL_NAV_ITEMS[key]).filter(isVisible);
  const userNav = filterItems(['dashboard', 'invoices', 'clients', 'products', 'reports']);
  const adminNav = filterItems(['support', 'userManagement', 'platformSettings']);
  const accountNav = filterItems(['settings']);
  const navGroups: NavGroup[] = [];
  if (userNav.length > 0) {
    navGroups.push({ items: userNav });
  }
  if (adminNav.length > 0) {
    navGroups.push({ title: 'Admin', items: adminNav });
  }
  if (accountNav.length > 0) {
    navGroups.push({ title: 'Account', items: accountNav });
  }
  return navGroups;
}