import { Agent } from 'agents';
import { v4 as uuidv4 } from 'uuid';
import type { Env } from './core-utils';
import type { BusinessState, Invoice, Client, Product, SubUser } from './types';
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
      paymentGateways: {},
      theme: { primaryColor: '221.2 83.2% 53.3%' },
    },
  };
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
  getInvoices(): Response {
    return Response.json({ success: true, data: this.state.invoices });
  }
  addInvoice(invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'activityLog'>): Response {
    const { subtotal, total } = calculateTotals(invoiceData.lineItems, invoiceData.discount, invoiceData.tax);
    const newInvoice: Invoice = {
      ...invoiceData,
      id: uuidv4(),
      invoiceNumber: this.getNextInvoiceNumber(),
      subtotal,
      total,
      activityLog: [{ date: new Date().toISOString(), action: 'Invoice Created' }],
    };
    this.setState({ ...this.state, invoices: [...this.state.invoices, newInvoice] });
    return Response.json({ success: true, data: newInvoice });
  }
  updateInvoice(updatedInvoice: Invoice): Response {
    const { subtotal, total } = calculateTotals(updatedInvoice.lineItems, updatedInvoice.discount, updatedInvoice.tax);
    const finalInvoice = {
      ...updatedInvoice,
      subtotal,
      total,
      activityLog: [{ date: new Date().toISOString(), action: 'Invoice Updated' }, ...updatedInvoice.activityLog],
    };
    this.setState({
      ...this.state,
      invoices: this.state.invoices.map(inv => (inv.id === finalInvoice.id ? finalInvoice : inv)),
    });
    return Response.json({ success: true, data: finalInvoice });
  }
  deleteInvoice(id: string): Response {
    this.setState({ ...this.state, invoices: this.state.invoices.filter(inv => inv.id !== id) });
    return Response.json({ success: true });
  }
  // --- Clients ---
  getClients(): Response {
    return Response.json({ success: true, data: this.state.clients });
  }
  addClient(clientData: Omit<Client, 'id'>): Response {
    const newClient: Client = { ...clientData, id: uuidv4() };
    this.setState({ ...this.state, clients: [...this.state.clients, newClient] });
    return Response.json({ success: true, data: newClient });
  }
  updateClient(updatedClient: Client): Response {
    this.setState({
      ...this.state,
      clients: this.state.clients.map(c => (c.id === updatedClient.id ? updatedClient : c)),
    });
    return Response.json({ success: true, data: updatedClient });
  }
  deleteClient(id: string): Response {
    this.setState({ ...this.state, clients: this.state.clients.filter(c => c.id !== id) });
    return Response.json({ success: true });
  }
  // --- Products ---
  getProducts(): Response {
    return Response.json({ success: true, data: this.state.products });
  }
  addProduct(productData: Omit<Product, 'id'>): Response {
    const newProduct: Product = { ...productData, id: uuidv4() };
    this.setState({ ...this.state, products: [...this.state.products, newProduct] });
    return Response.json({ success: true, data: newProduct });
  }
  updateProduct(updatedProduct: Product): Response {
    this.setState({
      ...this.state,
      products: this.state.products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)),
    });
    return Response.json({ success: true, data: updatedProduct });
  }
  deleteProduct(id: string): Response {
    this.setState({ ...this.state, products: this.state.products.filter(p => p.id !== id) });
    return Response.json({ success: true });
  }
  // --- Team Members ---
  getTeamMembers(): Response {
    return Response.json({ success: true, data: this.state.teamMembers });
  }
  addTeamMember(memberData: Omit<SubUser, 'id' | 'status'>): Response {
    const newMember: SubUser = { ...memberData, id: uuidv4(), status: 'Pending' };
    this.setState({ ...this.state, teamMembers: [...this.state.teamMembers, newMember] });
    return Response.json({ success: true, data: newMember });
  }
  updateTeamMember(updatedMember: SubUser): Response {
    this.setState({
      ...this.state,
      teamMembers: this.state.teamMembers.map(m => (m.id === updatedMember.id ? updatedMember : m)),
    });
    return Response.json({ success: true, data: updatedMember });
  }
  deleteTeamMember(id: string): Response {
    this.setState({ ...this.state, teamMembers: this.state.teamMembers.filter(m => m.id !== id) });
    return Response.json({ success: true });
  }
  // --- Main Request Handler ---
  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    try {
      if (path.startsWith('/invoices')) {
        if (method === 'GET') return this.getInvoices();
        if (method === 'POST') return this.addInvoice(await request.json());
        if (method === 'PUT') return this.updateInvoice(await request.json());
        if (method === 'DELETE') return this.deleteInvoice(path.split('/')[2]);
      }
      if (path.startsWith('/clients')) {
        if (method === 'GET') return this.getClients();
        if (method === 'POST') return this.addClient(await request.json());
        if (method === 'PUT') return this.updateClient(await request.json());
        if (method === 'DELETE') return this.deleteClient(path.split('/')[2]);
      }
      if (path.startsWith('/products')) {
        if (method === 'GET') return this.getProducts();
        if (method === 'POST') return this.addProduct(await request.json());
        if (method === 'PUT') return this.updateProduct(await request.json());
        if (method === 'DELETE') return this.deleteProduct(path.split('/')[2]);
      }
      if (path.startsWith('/team')) {
        if (method === 'GET') return this.getTeamMembers();
        if (method === 'POST') return this.addTeamMember(await request.json());
        if (method === 'PUT') return this.updateTeamMember(await request.json());
        if (method === 'DELETE') return this.deleteTeamMember(path.split('/')[2]);
      }
    } catch (e) {
      return Response.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
    return Response.json({ success: false, error: 'Not Found' }, { status: 404 });
  }
}