import type { Invoice, Client, Product, SubUser, Settings, ManagedUser, UserRole } from '@/types';
import type { User } from './auth';
const handleResponse = async (response: Response) => {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || `HTTP error! status: ${response.status}`);
  }
  return result.data;
};
const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(endpoint);
    return handleResponse(response);
  },
  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  put: async <T>(endpoint: string, body?: any): Promise<T> => {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
// Auth API
export const login = (email: string) => api.post<User>('/api/auth/login', { email });
export const signup = (name: string, email: string) => api.post<User>('/api/auth/signup', { name, email });
// User Management API
export const getManagedUsers = () => api.get<ManagedUser[]>('/api/users');
export const updateUserRole = (userId: string, role: UserRole) => api.put<ManagedUser>(`/api/users/${userId}/role`, { role });
export const toggleUserStatus = (userId: string) => api.put<ManagedUser>(`/api/users/${userId}/status`);
// Business Data API
const prepareInvoicePayload = (invoice: any) => ({
  ...invoice,
  clientId: invoice.client.id,
  issueDate: new Date(invoice.issueDate).toISOString(),
  dueDate: new Date(invoice.dueDate).toISOString(),
  client: undefined,
});
export const getInvoices = () => api.get<Invoice[]>('/api/data/invoices');
export const addInvoice = (invoice: Omit<Invoice, 'id'>) => api.post<Invoice>('/api/data/invoices', prepareInvoicePayload(invoice));
export const updateInvoice = (invoice: Invoice) => api.put<Invoice>(`/api/data/invoices`, prepareInvoicePayload(invoice));
export const deleteInvoice = (id: string) => api.delete(`/api/data/invoices/${id}`);
export const getClients = () => api.get<Client[]>('/api/data/clients');
export const addClient = (client: Omit<Client, 'id'>) => api.post<Client>('/api/data/clients', client);
export const updateClient = (client: Client) => api.put<Client>(`/api/data/clients`, client);
export const deleteClient = (id: string) => api.delete(`/api/data/clients/${id}`);
export const getProducts = () => api.get<Product[]>('/api/data/products');
export const addProduct = (product: Omit<Product, 'id'>) => api.post<Product>('/api/data/products', product);
export const updateProduct = (product: Product) => api.put<Product>(`/api/data/products`, product);
export const deleteProduct = (id: string) => api.delete(`/api/data/products/${id}`);
export const getTeamMembers = () => api.get<SubUser[]>('/api/data/team');
export const addTeamMember = (member: Omit<SubUser, 'id' | 'status'>) => api.post<SubUser>('/api/data/team', member);
export const updateTeamMember = (member: SubUser) => api.put<SubUser>('/api/data/team', member);
export const deleteTeamMember = (id: string) => api.delete(`/api/data/team/${id}`);
export const getSettings = () => api.get<Settings>('/api/data/settings');
export const updateSettings = (settings: Partial<Settings>) => api.put<Settings>('/api/data/settings', settings);