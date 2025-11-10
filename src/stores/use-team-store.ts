import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { SubUser, SubUserPermissions } from '@/types';
interface TeamState {
  teamMembers: SubUser[];
  addTeamMember: (member: Omit<SubUser, 'id' | 'status'>) => void;
  updateTeamMember: (member: SubUser) => void;
  deleteTeamMember: (id: string) => void;
}
const initialTeamMembers: SubUser[] = [
  {
    id: 'subuser-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    status: 'Active',
    permissions: {
      'dashboard:view': true,
      'invoices:view': true,
      'invoices:create': true,
      'clients:view': true,
    },
  },
  {
    id: 'subuser-2',
    name: 'John Smith',
    email: 'john.smith@example.com',
    status: 'Pending',
    permissions: {
      'dashboard:view': true,
      'invoices:view': true,
    },
  },
];
export const useTeamStore = create<TeamState>((set) => ({
  teamMembers: initialTeamMembers,
  addTeamMember: (member) => {
    const newMember: SubUser = {
      ...member,
      id: uuidv4(),
      status: 'Pending',
    };
    set((state) => ({ teamMembers: [...state.teamMembers, newMember] }));
  },
  updateTeamMember: (updatedMember) => {
    set((state) => ({
      teamMembers: state.teamMembers.map((member) =>
        member.id === updatedMember.id ? updatedMember : member
      ),
    }));
  },
  deleteTeamMember: (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter((member) => member.id !== id),
    }));
  },
}));