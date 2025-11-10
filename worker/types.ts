export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
// Zenvoyer Business Types
export type InvoiceStatus = 'Paid' | 'Unpaid' | 'Overdue' | 'Draft' | 'Partial';
export interface ActivityLogEntry {
  date: string; // Using ISO string for serialization
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
  clientId: string;
  issueDate: string; // Using ISO string
  dueDate: string; // Using ISO string
  lineItems: LineItem[];
  subtotal: number;
  discount: number;
  tax: number;
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
export type SubUserPermissions = Partial<Record<Permission, boolean>>;
export interface SubUser {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Pending';
  permissions: SubUserPermissions;
}
export interface PaymentGateway {
  name: 'Xendit' | 'Midtrans' | 'PayPal' | 'Stripe';
  isEnabled: boolean;
  apiKey: string;
  apiSecret: string;
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
// BusinessAgent State
export interface BusinessState {
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  teamMembers: SubUser[];
  settings: Settings;
}
// User Management Types
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'SUB_USER';
export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: 'Active' | 'Banned';
  createdAt: string; // ISO string
  plan: 'Free' | 'Pro';
}
// Support Ticket Types
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
// Original Chat Agent Types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
}
export interface SessionInfo {
  id: string;
  title: string;
  createdAt: number;
  lastActive: number;
}