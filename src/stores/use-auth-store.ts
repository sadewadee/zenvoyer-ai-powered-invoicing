import { create } from 'zustand';
import { authService, User } from '@/lib/auth';
import * as api from '@/lib/api-client';
import { useUserManagementStore } from './use-user-management-store';
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  updateProfile: (profileData: { name: string; email: string }) => Promise<void>;
  updateBusinessStage: (stage: 'new' | 'intermediate' | 'advanced') => Promise<void>;
}
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const { user: userFromApi, token } = await api.login(email, password);
      if (userFromApi && token) {
        const user: User = {
          id: userFromApi.id,
          name: userFromApi.name,
          email: userFromApi.email,
          role: userFromApi.role,
          plan: userFromApi.plan,
          businessStage: userFromApi.businessStage,
          avatarUrl: `https://i.pravatar.cc/150?u=${userFromApi.email}`
        };
        sessionStorage.setItem('zenvoyer_user_session', JSON.stringify(user));
        sessionStorage.setItem('zenvoyer_auth_token', token);
        set({ user, token, isAuthenticated: true, isLoading: false });
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
  signup: async (name: string, email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const { user: newUser, token } = await api.signup(name, email, password);
      useUserManagementStore.getState().addUser(newUser);
      const user: User = {
        ...newUser,
        avatarUrl: `https://i.pravatar.cc/150?u=${newUser.email}`
      };
      sessionStorage.setItem('zenvoyer_user_session', JSON.stringify(user));
      sessionStorage.setItem('zenvoyer_auth_token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      set({ isLoading: false });
      return false;
    }
  },
  logout: async () => {
    sessionStorage.removeItem('zenvoyer_user_session');
    sessionStorage.removeItem('zenvoyer_auth_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  checkAuth: () => {
    try {
      const sessionData = sessionStorage.getItem('zenvoyer_user_session');
      const token = sessionStorage.getItem('zenvoyer_auth_token');
      if (sessionData && token) {
        const user = JSON.parse(sessionData);
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to parse user session:", error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
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
      const { user: updatedUser, token } = await api.login(profileData.email, undefined);
      if (!updatedUser || !token) {
        set({ user: originalUser });
        throw new Error("Failed to refresh user session after profile update.");
      }
      const newUserState: User = { ...updatedUser, avatarUrl: `https://i.pravatar.cc/150?u=${updatedUser.email}` };
      sessionStorage.setItem('zenvoyer_user_session', JSON.stringify(newUserState));
      sessionStorage.setItem('zenvoyer_auth_token', token);
      set({ user: newUserState, token });
    } catch (error) {
      set({ user: originalUser });
      throw error;
    }
  },
  updateBusinessStage: async (stage) => {
    const { user } = get();
    if (!user) throw new Error("User not authenticated");
    try {
      const updatedUser = await api.updateUserBusinessStage(user.id, stage);
      const newUserState = { ...user, businessStage: updatedUser.businessStage };
      set({ user: newUserState });
      sessionStorage.setItem('zenvoyer_user_session', JSON.stringify(newUserState));
    } catch (error) {
      console.error("Failed to update business stage:", error);
      throw error;
    }
  },
}));
// Initialize auth state on app load
useAuthStore.getState().checkAuth();