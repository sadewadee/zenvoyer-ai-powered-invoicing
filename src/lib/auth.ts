import { useUserManagementStore } from "@/stores/use-user-management-store";
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SUB_USER';
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}
const SESSION_KEY = 'zenitho_user_session';
export const authService = {
  login: async (email: string): Promise<User | null> => {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));
    const allUsers = useUserManagementStore.getState().users;
    const managedUser = allUsers.find(u => u.email === email);
    if (managedUser && managedUser.status === 'Active') {
      const user: User = {
        id: managedUser.id,
        name: managedUser.name,
        email: managedUser.email,
        role: managedUser.role,
        avatarUrl: `https://i.pravatar.cc/150?u=${managedUser.email}`
      };
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
  getUserByEmail: (email: string): User | null => {
    const allUsers = useUserManagementStore.getState().users;
    const managedUser = allUsers.find(u => u.email === email);
    if (managedUser) {
      return {
        id: managedUser.id,
        name: managedUser.name,
        email: managedUser.email,
        role: managedUser.role,
      };
    }
    return null;
  }
};