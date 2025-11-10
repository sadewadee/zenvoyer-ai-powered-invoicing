import { useAuthStore } from '@/stores/use-auth-store';
import { useTeamStore } from '@/stores/use-team-store';
import type { UserRole, Permission } from '@/types';
export function usePermissions() {
  const user = useAuthStore(state => state.user);
  const teamMembers = useTeamStore(state => state.teamMembers);
  if (!user) {
    return {
      user: null,
      role: null,
      permissions: new Set<Permission>(),
      can: () => false,
      hasRole: () => false,
    };
  }
  const getPermissions = (): Set<Permission> => {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
      // Admins have all permissions for simplicity in this mock setup
      return new Set<Permission>([
        'dashboard:view', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete',
        'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
        'products:view', 'products:create', 'products:edit', 'products:delete',
        'reports:view', 'settings:view', 'team:manage',
        'admin:support', 'admin:super',
      ]);
    }
    if (user.role === 'USER') {
      // Primary users have all standard user permissions
      return new Set<Permission>([
        'dashboard:view', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete',
        'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
        'products:view', 'products:create', 'products:edit', 'products:delete',
        'reports:view', 'settings:view', 'team:manage',
      ]);
    }
    if (user.role === 'SUB_USER') {
      // Find the sub-user's specific permissions from the team store
      const subUser = teamMembers.find(member => member.email === user.email);
      if (subUser) {
        return new Set(Object.entries(subUser.permissions)
          .filter(([, value]) => value)
          .map(([key]) => key as Permission));
      }
    }
    return new Set<Permission>();
  };
  const permissions = getPermissions();
  const can = (permission: Permission | Permission[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.every(p => permissions.has(p));
    }
    return permissions.has(permission);
  };
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };
  return { user, role: user.role, permissions, can, hasRole };
}