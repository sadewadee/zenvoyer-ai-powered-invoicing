import { create } from 'zustand';
import { authService, User } from '@/lib/auth';
import * as api from '@/lib/api-client';
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  signup: (name: string, email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  updateProfile: (profileData: { name: string; email: string }) => Promise<void>;
}
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email: string) => {
    set({ isLoading: true });
    try {
      const user = await authService.login(email);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error("Login failed:", error);
      set({ isLoading: false });
      return false;
    }
  },
  signup: async (name: string, email: string) => {
    set({ isLoading: true });
    try {
      const newUser = await api.signup(name, email);
      const user = await authService.login(newUser.email);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error("Signup failed:", error);
      set({ isLoading: false });
      return false;
    }
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
  updateProfile: async (profileData: { name: string; email: string }) => {
    const { user } = get();
    if (!user) throw new Error("User not authenticated");
    const originalUser = { ...user };
    const optimisticUser = { ...user, ...profileData };
    set({ user: optimisticUser });
    try {
      await api.updateUserProfile(user.id, profileData);
      // Also update session storage
      authService.login(profileData.email);
    } catch (error) {
      set({ user: originalUser });
      throw error;
    }
  },
}));
// Initialize auth state on app load
useAuthStore.getState().checkAuth();