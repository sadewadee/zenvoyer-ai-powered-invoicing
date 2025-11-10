import { create } from 'zustand';
import type { UserRole } from '@/lib/auth';
import type { ManagedUser } from '@/types';
import { getManagedUsers, updateUserRole as apiUpdateUserRole, toggleUserStatus as apiToggleUserStatus } from '@/lib/api-client';
interface UserManagementState {
  users: ManagedUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
}
export const useUserManagementStore = create<UserManagementState>((set, get) => ({
  users: [],
  isLoading: true,
  error: null,
  fetchUsers: async () => {
    try {
      set({ isLoading: true, error: null });
      const users = await getManagedUsers();
      const typedUsers = users.map(u => ({ ...u, createdAt: new Date(u.createdAt) }));
      set({ users: typedUsers, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  updateUserRole: async (userId, newRole) => {
    const originalUsers = get().users;
    const optimisticUpdate = originalUsers.map(user =>
      user.id === userId ? { ...user, role: newRole } : user
    );
    set({ users: optimisticUpdate });
    try {
      await apiUpdateUserRole(userId, newRole);
      // Optionally refetch or trust the optimistic update
    } catch (error) {
      set({ users: originalUsers, error: (error as Error).message });
      throw error;
    }
  },
  toggleUserStatus: async (userId) => {
    const originalUsers = get().users;
    const optimisticUpdate = originalUsers.map(user =>
      user.id === userId ? { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' } : user
    );
    set({ users: optimisticUpdate });
    try {
      await apiToggleUserStatus(userId);
    } catch (error) {
      set({ users: originalUsers, error: (error as Error).message });
      throw error;
    }
  },
}));
// Initial fetch for admin panel
useUserManagementStore.getState().fetchUsers();