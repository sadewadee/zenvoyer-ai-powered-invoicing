import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { UserRole } from '@/lib/auth';
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Banned';
  createdAt: Date;
}
interface UserManagementState {
  users: ManagedUser[];
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
}
const initialUsers: ManagedUser[] = [
  { id: 'user-123', name: 'Alex Johnson', email: 'user@zenitho.app', role: 'USER', status: 'Active', createdAt: new Date('2023-01-15') },
  { id: 'admin-456', name: 'Maria Garcia', email: 'admin@zenitho.app', role: 'ADMIN', status: 'Active', createdAt: new Date('2023-02-20') },
  { id: 'super-789', name: 'Sam Chen', email: 'super@zenitho.app', role: 'SUPER_ADMIN', status: 'Active', createdAt: new Date('2023-01-01') },
  { id: 'user-002', name: 'Casey Lee', email: 'casey@example.com', role: 'USER', status: 'Active', createdAt: new Date('2023-03-10') },
  { id: 'user-003', name: 'Jordan Miller', email: 'jordan@example.com', role: 'USER', status: 'Banned', createdAt: new Date('2023-04-05') },
];
export const useUserManagementStore = create<UserManagementState>((set) => ({
  users: initialUsers,
  updateUserRole: (userId, newRole) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      ),
    }));
  },
  toggleUserStatus: (userId) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId ? { ...user, status: user.status === 'Active' ? 'Banned' : 'Active' } : user
      ),
    }));
  },
}));