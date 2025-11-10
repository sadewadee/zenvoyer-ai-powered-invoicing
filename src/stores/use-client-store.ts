import { create } from 'zustand';
import { toast } from 'sonner';
import type { Client } from '@/types';
import { getClients, addClient as apiAddClient, updateClient as apiUpdateClient, deleteClient as apiDeleteClient } from '@/lib/api-client';
interface ClientState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: () => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}
export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  isLoading: true,
  error: null,
  fetchClients: async () => {
    try {
      set({ isLoading: true, error: null });
      const clients = await getClients();
      set({ clients, isLoading: false });
    } catch (error) {
      const errorMessage = (error as Error).message;
      set({ error: errorMessage, isLoading: false });
      toast.error("Failed to load clients. Please try again later.");
    }
  },
  getClientById: (id) => get().clients.find(c => c.id === id),
  addClient: async (client) => {
    const newClient = await apiAddClient(client);
    set(state => ({ clients: [...state.clients, newClient] }));
  },
  updateClient: async (updatedClient) => {
    const returnedClient = await apiUpdateClient(updatedClient);
    set(state => ({
      clients: state.clients.map(client =>
        client.id === returnedClient.id ? returnedClient : client
      ),
    }));
  },
  deleteClient: async (id) => {
    await apiDeleteClient(id);
    set(state => ({
      clients: state.clients.filter(client => client.id !== id),
    }));
  },
}));
// Initial fetch
useClientStore.getState().fetchClients();