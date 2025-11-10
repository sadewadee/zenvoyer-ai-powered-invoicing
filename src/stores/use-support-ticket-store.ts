import { create } from 'zustand';
import type { SupportTicket, SupportTicketStatus } from '@/types';
import { createSupportTicket, getSupportTickets, updateSupportTicketStatus } from '@/lib/api-client';
interface SupportTicketState {
  tickets: SupportTicket[];
  isLoading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  addTicket: (ticketData: { userId: string; userEmail: string; subject: string; message: string }) => Promise<void>;
  updateStatus: (ticketId: string, status: SupportTicketStatus) => Promise<void>;
}
export const useSupportTicketStore = create<SupportTicketState>((set, get) => ({
  tickets: [],
  isLoading: true,
  error: null,
  fetchTickets: async () => {
    try {
      set({ isLoading: true, error: null });
      const tickets = await getSupportTickets();
      set({ tickets, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  addTicket: async (ticketData) => {
    const newTicket = await createSupportTicket(ticketData);
    set(state => ({ tickets: [newTicket, ...state.tickets] }));
  },
  updateStatus: async (ticketId, status) => {
    const updatedTicket = await updateSupportTicketStatus(ticketId, status);
    set(state => ({
      tickets: state.tickets.map(ticket =>
        ticket.id === ticketId ? updatedTicket : ticket
      ),
    }));
  },
}));
// Initial fetch
useSupportTicketStore.getState().fetchTickets();