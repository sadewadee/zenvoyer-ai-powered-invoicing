import { Agent } from 'agents';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from './core-utils';
import type { BusinessState, Invoice, Client, Product, SubUser, Settings, ActivityLogEntry, ManagedUser, UserRole, Permission, SubUserPermissions } from './types';
import { getAppController } from './core-utils';
const ALL_PERMISSIONS: Permission[] = [
  'dashboard:view', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete',
  'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
  'products:view', 'products:create', 'products:edit', 'products:delete',
  'reports:view', 'settings:view', 'team:manage', 'admin:support', 'admin:super',
];
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  ADMIN: [ 'dashboard:view', 'invoices:view', 'clients:view', 'products:view', 'reports:view', 'admin:support' ],
  USER: [
    'dashboard:view', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:delete',
    'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
    'products:view', 'products:create', 'products:edit', 'products:delete',
    'reports:view', 'settings:view', 'team:manage',
  ],
  SUB_USER: [], // Permissions are defined per sub-user
};
type JWTPayload = {
    id: string;
    role: UserRole;
    parentUserId?: string;
};
const calculateTotals = (lineItems: any[], discount: number, tax: number) => {
  const subtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  const discountAmount = subtotal * (discount / 100);
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const total = subtotal - discountAmount + taxAmount;
  return { subtotal, total };
};
export class BusinessAgent extends Agent<Env, BusinessState> {
  initialState: BusinessState = {
    invoices: [],
    clients: [],
    products: [],
    teamMembers: [],
    settings: {
      business: { companyName: 'Your Company', address: '123 Main St, Anytown, USA', taxId: '' },
      paymentGateways: {
        Xendit: { name: 'Xendit', isEnabled: false, apiKey: '', apiSecret: '' },
        Midtrans: { name: 'Midtrans', isEnabled: false, apiKey: '', apiSecret: '' },
        PayPal: { name: 'PayPal', isEnabled: false, apiKey: '', apiSecret: '' },
        Stripe: { name: 'Stripe', isEnabled: false, apiKey: '', apiSecret: '' },
      },
      theme: { primaryColor: '221.2 83.2% 53.3%', colorScheme: 'system' },
    },
  };
  private getPermissions(user: JWTPayload): Set<Permission> {
    if (user.role === 'SUB_USER') {
      const subUser = this.state.teamMembers.find(m => m.email === user.id); // Assuming sub-user ID is their email for now
      if (subUser) {
        return new Set(Object.entries(subUser.permissions).filter(([, value]) => value).map(([key]) => key as Permission));
      }
      return new Set();
    }
    return new Set(ROLE_PERMISSIONS[user.role] || []);
  }
  private can(user: JWTPayload, permission: Permission): boolean {
    return this.getPermissions(user).has(permission);
  }
  private getNextInvoiceNumber(): string {
    const invoices = this.state.invoices;
    if (invoices.length === 0) return 'INV-001';
    const lastInvoiceNumber = invoices.reduce((max, inv) => {
      const num = parseInt(inv.invoiceNumber.split('-')[1]);
      return num > max ? num : max;
    }, 0);
    return `INV-${(lastInvoiceNumber + 1).toString().padStart(3, '0')}`;
  }
  // --- Invoices ---
  getInvoices(): Response { return Response.json({ success: true, data: this.state.invoices }); }
  async addInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'activityLog'> & { userId: string }): Promise<Response> {
    const { subtotal, total } = calculateTotals(invoiceData.lineItems, invoiceData.discount, invoiceData.tax);
    const newInvoice: Invoice = { ...invoiceData, id: uuidv4(), invoiceNumber: this.getNextInvoiceNumber(), subtotal, total, activityLog: [{ date: new Date().toISOString(), action: 'Invoice Created' }], };
    this.setState({ ...this.state, invoices: [...this.state.invoices, newInvoice] });
    const controller = getAppController(this.env);
    await controller.fetch(new Request(`https://.../users/${invoiceData.userId}/stage-check`, { method: 'POST' }));
    return Response.json({ success: true, data: newInvoice });
  }
  updateInvoice(updatedInvoice: Invoice): Response {
    const originalInvoice = this.state.invoices.find(inv => inv.id === updatedInvoice.id);
    if (!originalInvoice) return Response.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    const newActivityLog: ActivityLogEntry[] = [];
    const now = new Date().toISOString();
    if (originalInvoice.status !== updatedInvoice.status) newActivityLog.push({ date: now, action: `Status changed from ${originalInvoice.status} to ${updatedInvoice.status}` });
    const paymentMade = updatedInvoice.amountPaid - originalInvoice.amountPaid;
    if (paymentMade > 0) newActivityLog.push({ date: now, action: `Payment of ${paymentMade.toFixed(2)} received.` });
    const { subtotal, total } = calculateTotals(updatedInvoice.lineItems, updatedInvoice.discount, updatedInvoice.tax);
    const finalInvoice = { ...updatedInvoice, subtotal, total, activityLog: [...newActivityLog, ...updatedInvoice.activityLog], };
    this.setState({ ...this.state, invoices: this.state.invoices.map(inv => (inv.id === finalInvoice.id ? finalInvoice : inv)), });
    return Response.json({ success: true, data: finalInvoice });
  }
  deleteInvoice(id: string): Response { this.setState({ ...this.state, invoices: this.state.invoices.filter(inv => inv.id !== id) }); return Response.json({ success: true }); }
  // --- Clients ---
  getClients(): Response { return Response.json({ success: true, data: this.state.clients }); }
  addClient(clientData: Omit<Client, 'id'>): Response { const newClient: Client = { ...clientData, id: uuidv4() }; this.setState({ ...this.state, clients: [...this.state.clients, newClient] }); return Response.json({ success: true, data: newClient }); }
  updateClient(updatedClient: Client): Response { this.setState({ ...this.state, clients: this.state.clients.map(c => (c.id === updatedClient.id ? updatedClient : c)), }); return Response.json({ success: true, data: updatedClient }); }
  deleteClient(id: string): Response { this.setState({ ...this.state, clients: this.state.clients.filter(c => c.id !== id) }); return Response.json({ success: true }); }
  // --- Products ---
  getProducts(): Response { return Response.json({ success: true, data: this.state.products }); }
  addProduct(productData: Omit<Product, 'id'>): Response { const newProduct: Product = { ...productData, id: uuidv4() }; this.setState({ ...this.state, products: [...this.state.products, newProduct] }); return Response.json({ success: true, data: newProduct }); }
  updateProduct(updatedProduct: Product): Response { this.setState({ ...this.state, products: this.state.products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)), }); return Response.json({ success: true, data: updatedProduct }); }
  deleteProduct(id: string): Response { this.setState({ ...this.state, products: this.state.products.filter(p => p.id !== id) }); return Response.json({ success: true }); }
  // --- Team Members ---
  getTeamMembers(): Response { return Response.json({ success: true, data: this.state.teamMembers }); }
  addTeamMember(memberData: Omit<SubUser, 'id' | 'status'>): Response { const newMember: SubUser = { ...memberData, id: uuidv4(), status: 'Pending' }; this.setState({ ...this.state, teamMembers: [...this.state.teamMembers, newMember] }); return Response.json({ success: true, data: newMember }); }
  updateTeamMember(updatedMember: SubUser): Response { this.setState({ ...this.state, teamMembers: this.state.teamMembers.map(m => (m.id === updatedMember.id ? updatedMember : m)), }); return Response.json({ success: true, data: updatedMember }); }
  deleteTeamMember(id: string): Response { this.setState({ ...this.state, teamMembers: this.state.teamMembers.filter(m => m.id !== id) }); return Response.json({ success: true }); }
  // --- Settings ---
  getSettings(): Response { return Response.json({ success: true, data: this.state.settings }); }
  updateSettings(newSettings: Partial<Settings>): Response { const updatedSettings = { ...this.state.settings, ...newSettings, theme: { ...this.state.settings.theme, ...newSettings.theme }, }; this.setState({ ...this.state, settings: updatedSettings }); return Response.json({ success: true, data: updatedSettings }); }
  // --- Main Request Handler ---
  async onRequest(request: Request): Promise<Response> {
    const userPayload = request.headers.get('X-User-Payload');
    if (!userPayload) return Response.json({ success: false, error: 'Forbidden: Missing user context' }, { status: 403 });
    const user: JWTPayload = JSON.parse(userPayload);
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    const forbidden = () => Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
    try {
      if (path.startsWith('/invoices')) {
        if (method === 'GET') { if (!this.can(user, 'invoices:view')) return forbidden(); return this.getInvoices(); }
        if (method === 'POST') { if (!this.can(user, 'invoices:create')) return forbidden(); return this.addInvoice(await request.json()); }
        if (method === 'PUT') { if (!this.can(user, 'invoices:edit')) return forbidden(); return this.updateInvoice(await request.json()); }
        if (method === 'DELETE') { if (!this.can(user, 'invoices:delete')) return forbidden(); return this.deleteInvoice(path.split('/')[2]); }
      }
      if (path.startsWith('/clients')) {
        if (method === 'GET') { if (!this.can(user, 'clients:view')) return forbidden(); return this.getClients(); }
        if (method === 'POST') { if (!this.can(user, 'clients:create')) return forbidden(); return this.addClient(await request.json()); }
        if (method === 'PUT') { if (!this.can(user, 'clients:edit')) return forbidden(); return this.updateClient(await request.json()); }
        if (method === 'DELETE') { if (!this.can(user, 'clients:delete')) return forbidden(); return this.deleteClient(path.split('/')[2]); }
      }
      if (path.startsWith('/products')) {
        if (method === 'GET') { if (!this.can(user, 'products:view')) return forbidden(); return this.getProducts(); }
        if (method === 'POST') { if (!this.can(user, 'products:create')) return forbidden(); return this.addProduct(await request.json()); }
        if (method === 'PUT') { if (!this.can(user, 'products:edit')) return forbidden(); return this.updateProduct(await request.json()); }
        if (method === 'DELETE') { if (!this.can(user, 'products:delete')) return forbidden(); return this.deleteProduct(path.split('/')[2]); }
      }
      if (path.startsWith('/team')) {
        if (!this.can(user, 'team:manage')) return forbidden();
        if (method === 'GET') return this.getTeamMembers();
        if (method === 'POST') return this.addTeamMember(await request.json());
        if (method === 'PUT') return this.updateTeamMember(await request.json());
        if (method === 'DELETE') return this.deleteTeamMember(path.split('/')[2]);
      }
      if (path.startsWith('/settings')) {
        if (!this.can(user, 'settings:view')) return forbidden();
        if (method === 'GET') return this.getSettings();
        if (method === 'PUT') return this.updateSettings(await request.json());
      }
    } catch (e) {
      return Response.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
    return Response.json({ success: false, error: 'Not Found' }, { status: 404 });
  }
}