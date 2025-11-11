import type { Invoice, Client, Product, SubUser, Settings, ManagedUser, UserRole, PlatformSettings, SupportTicket, SupportTicketStatus } from '@/types';
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
export const login = (email: string, password?: string) => api.post<User>('/api/auth/login', { email, password });
export const signup = (name: string, email: string, password?: string) => api.post<ManagedUser>('/api/auth/signup', { name, email, password });
// User Management API
export const getManagedUsers = () => api.get<ManagedUser[]>('/api/users');
export const updateUserRole = (userId: string, role: UserRole) => api.put<ManagedUser>(`/api/users/${userId}/role`, { role });
export const toggleUserStatus = (userId: string) => api.put<ManagedUser>(`/api/users/${userId}/status`);
export const updateUserPlan = (userId: string, plan: 'Free' | 'Pro') => api.put<ManagedUser>(`/api/users/${userId}/plan`, { plan });
export const updateUserProfile = (userId: string, profileData: { name: string; email: string }) => api.put<ManagedUser>(`/api/users/${userId}/profile`, profileData);
// Platform Settings API
export const getPlatformSettings = () => api.get<PlatformSettings>('/api/platform/settings');
export const updatePlatformSettings = (settings: Partial<PlatformSettings>) => api.put<PlatformSettings>('/api/platform/settings', settings);
// Support Tickets API
export const createSupportTicket = (ticketData: { userId: string; userEmail: string; subject: string; message: string }) => api.post<SupportTicket>('/api/support/tickets', ticketData);
export const getSupportTickets = () => api.get<SupportTicket[]>('/api/support/tickets');
export const updateSupportTicketStatus = (ticketId: string, status: SupportTicketStatus) => api.put<SupportTicket>(`/api/support/tickets/${ticketId}/status`, { status });
// Business Data API
const prepareInvoicePayload = (invoice: any) => ({
  ...invoice,
  clientId: invoice.client.id,
  issueDate: new Date(invoice.issueDate).toISOString(),
  dueDate: new Date(invoice.dueDate).toISOString(),
  client: undefined,
});
export const getInvoices = () => api.get<Invoice[]>('/api/data/invoices');
export const addInvoice = (invoice: Omit<Invoice, 'id'>, userId: string) => api.post<Invoice>('/api/data/invoices', { ...prepareInvoicePayload(invoice), userId });
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