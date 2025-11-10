import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Client } from '@/types';
interface ClientState {
  clients: Client[];
  getClients: () => Client[];
  getClientById: (id: string) => Client | undefined;
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
}
const initialClients: Client[] = [
  { id: 'client-1', name: 'Acme Inc.', email: 'contact@acme.com', address: '123 Acme St, Business City, USA', phone: '555-0101' },
  { id: 'client-2', name: 'Stark Industries', email: 'tony@starkindustries.com', address: '10880 Malibu Point, 90265, CA', phone: '555-0102' },
  { id: 'client-3', name: 'Wayne Enterprises', email: 'bruce@wayne-enterprises.com', address: '1007 Mountain Drive, Gotham City', phone: '555-0103' },
];
export const useClientStore = create<ClientState>((set, get) => ({
  clients: initialClients,
  getClients: () => get().clients,
  getClientById: (id) => get().clients.find(c => c.id === id),
  addClient: (client) => {
    const newClient = { ...client, id: uuidv4() };
    set(state => ({ clients: [...state.clients, newClient] }));
  },
  updateClient: (updatedClient) => {
    set(state => ({
      clients: state.clients.map(client =>
        client.id === updatedClient.id ? updatedClient : client
      ),
    }));
  },
  deleteClient: (id) => {
    set(state => ({
      clients: state.clients.filter(client => client.id !== id),
    }));
  },
}));