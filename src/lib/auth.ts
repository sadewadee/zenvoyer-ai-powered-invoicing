import * as api from './api-client';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SUB_USER';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
const SESSION_KEY = 'zenvoyer_user_session';
export const authService = {
  login: async (email: string, password?: string): Promise<User | null> => {
    try {
      const userFromApi = await api.login(email, password);
      if (userFromApi) {
        const user: User = {
          ...userFromApi,
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