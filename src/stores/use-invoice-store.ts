import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Invoice, LineItem } from '@/types';
import { useClientStore } from './use-client-store';
interface InvoiceState {
  invoices: Invoice[];
  getInvoices: () => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'activityLog'>) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  getNextInvoiceNumber: () => string;
}
const calculateTotals = (lineItems: LineItem[], discount: number, tax: number) => {
  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const total = subtotal - discountAmount + taxAmount;
  return { subtotal, total };
};
const initialClients = useClientStore.getState().clients;
const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-001',
    client: initialClients[0],
    issueDate: new Date('2023-10-25'),
    dueDate: new Date('2023-11-25'),
    lineItems: [{ id: 'li-1', description: 'Web Development', quantity: 1, unitPrice: 2500, cost: 1200, total: 2500 }],
    subtotal: 2500,
    discount: 0,
    tax: 10,
    total: 2750,
    status: 'Paid',
    activityLog: [
      { date: new Date('2023-10-25'), action: 'Invoice Created' },
      { date: new Date('2023-10-26'), action: 'Invoice Sent' },
      { date: new Date('2023-11-15'), action: 'Payment Received' },
    ]
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-002',
    client: initialClients[1],
    issueDate: new Date('2023-10-28'),
    dueDate: new Date('2023-11-28'),
    lineItems: [{ id: 'li-2', description: 'Arc Reactor Maintenance', quantity: 1, unitPrice: 1500, cost: 500, total: 1500 }],
    subtotal: 1500,
    discount: 0,
    tax: 0,
    total: 1500,
    status: 'Unpaid',
    activityLog: [
      { date: new Date('2023-10-28'), action: 'Invoice Created' },
    ]
  },
];
export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: initialInvoices,
  getInvoices: () => get().invoices,
  getInvoiceById: (id) => get().invoices.find(inv => inv.id === id),
  addInvoice: (invoiceData) => {
    const { subtotal, total } = calculateTotals(invoiceData.lineItems, invoiceData.discount, invoiceData.tax);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: uuidv4(),
      invoiceNumber: get().getNextInvoiceNumber(),
      subtotal,
      total,
      activityLog: [{ date: new Date(), action: 'Invoice Created' }],
    };
    set(state => ({ invoices: [...state.invoices, newInvoice] }));
  },
  updateInvoice: (updatedInvoice) => {
    const { subtotal, total } = calculateTotals(updatedInvoice.lineItems, updatedInvoice.discount, updatedInvoice.tax);
    const finalInvoice = {
      ...updatedInvoice,
      subtotal,
      total,
      activityLog: [
        { date: new Date(), action: 'Invoice Updated' },
        ...updatedInvoice.activityLog,
      ],
    };
    set(state => ({
      invoices: state.invoices.map(invoice =>
        invoice.id === finalInvoice.id ? finalInvoice : invoice
      ),
    }));
  },
  deleteInvoice: (id) => {
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