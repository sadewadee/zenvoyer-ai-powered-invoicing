import type { UserRole, Permission, SubUserPermissions } from '@/types';
import type { User } from './auth';
export const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete',
  'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
  'products:view', 'products:create', 'products:edit', 'products:delete',
  'reports:view', 'settings:view', 'team:manage', 'admin:support', 'admin:super',
];
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: [
    'dashboard:view', 'invoices:view', 'clients:view', 'products:view',
    'reports:view', 'admin:support',
  ],
  USER: [
    'dashboard:view', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete',
    'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
    'products:view', 'products:create', 'products:edit', 'products:delete',
    'reports:view', 'settings:view', 'team:manage',
  ],
  SUB_USER: [], // Permissions are defined per sub-user
};
export const SUB_USER_TEMPLATES: Record<string, { name: string, permissions: SubUserPermissions }> = {
  invoiceSpecialist: {
    name: 'Invoice Specialist',
    permissions: {
      'dashboard:view': true,
      'invoices:view': true,
      'invoices:create': true,
      'invoices:edit': true,
    },
  },
  clientManager: {
    name: 'Client Manager',
    permissions: {
      'dashboard:view': true,
      'clients:view': true,
      'clients:create': true,
      'clients:edit': true,
    },
  },
  accountant: {
    name: 'Accountant',
    permissions: {
      'dashboard:view': true,
      'invoices:view': true,
      'reports:view': true,
    },
  },
};
export function getPermissionsForUser(user: User, subUserPermissions?: SubUserPermissions): Set<Permission> {
  if (!user) return new Set();
  if (user.role === 'SUB_USER' && subUserPermissions) {
    return new Set(
      Object.entries(subUserPermissions)
        .filter(([, value]) => value)
        .map(([key]) => key as Permission)
    );
  }
  return new Set(ROLE_PERMISSIONS[user.role] || []);
}