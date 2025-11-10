import { create } from 'zustand';
import type { SubUser } from '@/types';
import { getTeamMembers, addTeamMember as apiAddTeamMember, updateTeamMember as apiUpdateTeamMember, deleteTeamMember as apiDeleteTeamMember } from '@/lib/api-client';
interface TeamState {
  teamMembers: SubUser[];
  isLoading: boolean;
  error: string | null;
  fetchTeamMembers: () => Promise<void>;
  addTeamMember: (member: Omit<SubUser, 'id' | 'status'>) => Promise<void>;
  updateTeamMember: (member: SubUser) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
}
export const useTeamStore = create<TeamState>((set) => ({
  teamMembers: [],
  isLoading: true,
  error: null,
  fetchTeamMembers: async () => {
    try {
      set({ isLoading: true, error: null });
      const teamMembers = await getTeamMembers();
      set({ teamMembers, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  addTeamMember: async (memberData) => {
    const newMember = await apiAddTeamMember(memberData);
    set(state => ({ teamMembers: [...state.teamMembers, newMember] }));
  },
  updateTeamMember: async (updatedMember) => {
    const returnedMember = await apiUpdateTeamMember(updatedMember);
    set(state => ({
      teamMembers: state.teamMembers.map(member =>
        member.id === returnedMember.id ? returnedMember : member
      ),
    }));
  },
  deleteTeamMember: async (id) => {
    await apiDeleteTeamMember(id);
    set(state => ({
      teamMembers: state.teamMembers.filter(member => member.id !== id),
    }));
  },
}));
// Initial fetch
useTeamStore.getState().fetchTeamMembers();