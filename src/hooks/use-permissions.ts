import { useAuthStore } from '@/stores/use-auth-store';
import { useTeamStore } from '@/stores/use-team-store';
import type { UserRole, Permission } from '@/types';
import { getPermissionsForUser } from '@/lib/permissions';
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
      businessStage: 'new' as const,
    };
  }
  const subUserRecord = user.role === 'SUB_USER'
    ? teamMembers.find(member => member.email === user.email)
    : undefined;
  const permissions = getPermissionsForUser(user, subUserRecord?.permissions);
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
  return {
    user,
    role: user.role,
    permissions,
    can,
    hasRole,
    businessStage: user.businessStage,
  };
}