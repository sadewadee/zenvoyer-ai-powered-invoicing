export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Draft' | 'Partial';
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: Client;
  issueDate: Date;
  dueDate: Date;
  lineItems: LineItem[];
  subtotal: number;
  discount: number; // as a percentage
  tax: number; // as a percentage
  total: number;
  status: InvoiceStatus;
}
export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone: string;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  category?: string;
}