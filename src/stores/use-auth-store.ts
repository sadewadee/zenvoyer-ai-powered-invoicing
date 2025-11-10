import { create } from 'zustand';
import { authService, User } from '@/lib/auth';
import { useUserManagementStore } from './use-user-management-store';
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email: string) => {
    set({ isLoading: true });
    const user = await authService.login(email);
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },
  signup: async (name: string, email: string) => {
    set({ isLoading: true });
    const { addUser } = useUserManagementStore.getState();
    const existingUser = authService.getUserByEmail(email);
    if (existingUser) {
      set({ isLoading: false });
      return false; // User already exists
    }
    const newUser = addUser({ name, email });
    const user = await authService.login(newUser.email);
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },
  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: () => {
    const user = authService.getCurrentUser();
    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
// Initialize auth state on app load
useAuthStore.getState().checkAuth();