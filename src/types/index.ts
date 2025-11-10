export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SUB_USER';
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Draft' | 'Partial';
export type Permission =
  | 'dashboard:view'
  | 'invoices:view'
  | 'invoices:create'
  | 'invoices:edit'
  | 'invoices:delete'
  | 'clients:view'
  | 'clients:create'
  | 'clients:edit'
  | 'clients:delete'
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'reports:view'
  | 'settings:view'
  | 'team:manage'
  | 'admin:support'
  | 'admin:super';
export interface ActivityLogEntry {
  date: Date;
  action: string;
}
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  cost?: number;
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
  amountPaid: number;
  status: InvoiceStatus;
  activityLog: ActivityLogEntry[];
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
  cost?: number;
  category?: string;
}
export type SubUserPermissions = Partial<Record<Permission, boolean>>;
export interface SubUser {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Pending';
  permissions: SubUserPermissions;
}
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Banned';
  createdAt: Date;
  plan: 'Free' | 'Pro';
}
export interface PaymentGateway {
  name: 'Xendit' | 'Midtrans' | 'PayPal' | 'Stripe';
  isEnabled: boolean;
  apiKey: string;
  apiSecret: string;
}
export interface PaymentGatewayState {
  gateways: Record<string, PaymentGateway>;
  updateGateway: (name: string, settings: Partial<PaymentGateway>) => void;
}
export interface BusinessDetails {
  companyName: string;
  address: string;
  taxId?: string;
}
export interface ThemeSettings {
  primaryColor: string;
}
export interface Settings {
  business: BusinessDetails;
  paymentGateways: Record<string, PaymentGateway>;
  theme: ThemeSettings;
}
export interface PlatformSettings {
  subscriptionGateways: Record<string, PaymentGateway>;
}
export type SupportTicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type SupportTicketPriority = 'Low' | 'Medium' | 'High';
export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: string; // ISO string
}