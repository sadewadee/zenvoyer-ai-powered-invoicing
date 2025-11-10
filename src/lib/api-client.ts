import type { Invoice, Client, Product, SubUser, Settings } from '@/types';
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'API operation failed');
  }
  return result.data;
};
const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`/api/data${endpoint}`);
    return handleResponse(response);
  },
  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`/api/data${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`/api/data${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return handleResponse(response);
  },
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`/api/data${endpoint}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};
// Helper to prepare invoice data for API calls
const prepareInvoicePayload = (invoice: any) => {
  return {
    ...invoice,
    clientId: invoice.client.id,
    issueDate: new Date(invoice.issueDate).toISOString(),
    dueDate: new Date(invoice.dueDate).toISOString(),
    client: undefined, // Remove nested client object
  };
};
// Invoice API
export const getInvoices = () => api.get<Invoice[]>('/invoices');
export const addInvoice = (invoice: Omit<Invoice, 'id'>) => api.post<Invoice>('/invoices', prepareInvoicePayload(invoice));
export const updateInvoice = (invoice: Invoice) => api.put<Invoice>(`/invoices`, prepareInvoicePayload(invoice));
export const deleteInvoice = (id: string) => api.delete(`/invoices/${id}`);
// Client API
export const getClients = () => api.get<Client[]>('/clients');
export const addClient = (client: Omit<Client, 'id'>) => api.post<Client>('/clients', client);
export const updateClient = (client: Client) => api.put<Client>(`/clients`, client);
export const deleteClient = (id: string) => api.delete(`/clients/${id}`);
// Product API
export const getProducts = () => api.get<Product[]>('/products');
export const addProduct = (product: Omit<Product, 'id'>) => api.post<Product>('/products', product);
export const updateProduct = (product: Product) => api.put<Product>(`/products`, product);
export const deleteProduct = (id: string) => api.delete(`/products/${id}`);
// Team API
export const getTeamMembers = () => api.get<SubUser[]>('/team');
export const addTeamMember = (member: Omit<SubUser, 'id' | 'status'>) => api.post<SubUser>('/team', member);
export const updateTeamMember = (member: SubUser) => api.put<SubUser>('/team', member);
export const deleteTeamMember = (id: string) => api.delete(`/team/${id}`);
// Settings API
export const getSettings = () => api.get<Settings>('/settings');
export const updateSettings = (settings: Partial<Settings>) => api.put<Settings>('/settings', settings);