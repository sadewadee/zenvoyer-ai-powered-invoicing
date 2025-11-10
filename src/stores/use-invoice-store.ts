import { create } from 'zustand';
import type { Invoice } from '@/types';
import { getInvoices, addInvoice as apiAddInvoice, updateInvoice as apiUpdateInvoice, deleteInvoice as apiDeleteInvoice } from '@/lib/api-client';
interface InvoiceState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  getInvoiceById: (id: string) => Invoice | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (invoice: Invoice) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  getNextInvoiceNumber: () => string;
}
export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  isLoading: true,
  error: null,
  fetchInvoices: async () => {
    try {
      set({ isLoading: true, error: null });
      const invoices = await getInvoices();
      set({ invoices: invoices.map(i => ({...i, issueDate: new Date(i.issueDate), dueDate: new Date(i.dueDate)})), isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
  getInvoiceById: (id) => get().invoices.find(inv => inv.id === id),
  addInvoice: async (invoiceData) => {
    const newInvoice = await apiAddInvoice(invoiceData);
    set(state => ({ invoices: [...state.invoices, {...newInvoice, issueDate: new Date(newInvoice.issueDate), dueDate: new Date(newInvoice.dueDate)}] }));
  },
  updateInvoice: async (updatedInvoice) => {
    const returnedInvoice = await apiUpdateInvoice(updatedInvoice);
    set(state => ({
      invoices: state.invoices.map(invoice =>
        invoice.id === returnedInvoice.id ? {...returnedInvoice, issueDate: new Date(returnedInvoice.issueDate), dueDate: new Date(returnedInvoice.dueDate)} : invoice
      ),
    }));
  },
  deleteInvoice: async (id) => {
    await apiDeleteInvoice(id);
    set(state => ({
      invoices: state.invoices.filter(invoice => invoice.id !== id),
    }));
  },
  getNextInvoiceNumber: () => {
    const invoices = get().invoices;
    if (invoices.length === 0) return 'INV-001';
    const lastInvoiceNumber = invoices.reduce((max, inv) => {
        const num = parseInt(inv.invoiceNumber.split('-')[1]);
        return num > max ? num : max;
    }, 0);
    return `INV-${(lastInvoiceNumber + 1).toString().padStart(3, '0')}`;
  },
}));
// Initial fetch
useInvoiceStore.getState().fetchInvoices();