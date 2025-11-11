import * as api from './api-client';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SUB_USER';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  plan: 'Free' | 'Pro';
  businessStage: 'new' | 'intermediate' | 'advanced';
}
const SESSION_KEY = 'zenvoyer_user_session';
export const authService = {
  login: async (email: string, password?: string, isReAuth = false): Promise<User | null> => {
    try {
      // For re-authentication, we don't need a password. The backend should handle this.
      const userFromApi = await api.login(email, isReAuth ? undefined : password);
      if (userFromApi) {
        const user: User = {
          id: userFromApi.id,
          name: userFromApi.name,
          email: userFromApi.email,
          role: userFromApi.role,
          plan: userFromApi.plan,
          businessStage: userFromApi.businessStage,
          avatarUrl: `https://i.pravatar.cc/150?u=${userFromApi.email}`
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error) {
      console.error("AuthService login failed:", error);
      return null;
    }
  },
  logout: async (): Promise<void> => {
    sessionStorage.removeItem(SESSION_KEY);
  },
  getCurrentUser: (): User | null => {
    try {
      const sessionData = sessionStorage.getItem(SESSION_KEY);
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      return null;
    } catch (error) {
      console.error("Failed to parse user session:", error);
      return null;
    }
  },
};