export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SUB_USER';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
// Mock user database
const users: Record<string, User> = {
  'user@zenitho.app': { id: 'user-123', name: 'Alex Johnson', email: 'user@zenitho.app', role: 'USER', avatarUrl: 'https://i.pravatar.cc/150?u=user@zenitho.app' },
  'admin@zenitho.app': { id: 'admin-456', name: 'Maria Garcia', email: 'admin@zenitho.app', role: 'ADMIN', avatarUrl: 'https://i.pravatar.cc/150?u=admin@zenitho.app' },
  'super@zenitho.app': { id: 'super-789', name: 'Sam Chen', email: 'super@zenitho.app', role: 'SUPER_ADMIN', avatarUrl: 'https://i.pravatar.cc/150?u=super@zenitho.app' },
};
const SESSION_KEY = 'zenitho_user_session';
export const authService = {
  login: async (email: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));
    const user = users[email];
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    return null;
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