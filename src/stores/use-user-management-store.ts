import { create } from 'zustand';
import type { UserRole } from '@/lib/auth';
import type { ManagedUser } from '@/types';
import { getManagedUsers } from '@/lib/api-client';
interface UserManagementState {
  users: ManagedUser[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
}
export const useUserManagementStore = create<UserManagementState>((set) => ({
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
  updateUserRole: (userId, newRole) => {
    // This is now a mock UI update. Real logic is on the backend.
    // A full implementation would involve an API call and refetching users.
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      ),
    }));
    console.warn("Mock role update. Implement API call.");
  },
  toggleUserStatus: (userId) => {
    // This is now a mock UI update.
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' } : user
      ),
    }));
    console.warn("Mock status toggle. Implement API call.");
  },
}));
// Initial fetch for admin panel
useUserManagementStore.getState().fetchUsers();