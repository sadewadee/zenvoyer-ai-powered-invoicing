import { DurableObject } from 'cloudflare:workers';
import { v4 as uuidv4 } from 'uuid';
import type { SessionInfo, ManagedUser, UserRole, PlatformSettings, SupportTicket, SupportTicketStatus } from './types';
import type { Env } from './core-utils';
// In a real app, use a proper hashing library like bcrypt or Argon2.
// This is a mock for demonstration purposes.
const mockHash = (password: string) => `hashed_${password}`;
const mockVerify = (password: string, hash: string) => mockHash(password) === hash;
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private users = new Map<string, ManagedUser>();
  private supportTickets = new Map<string, SupportTicket>();
  private platformSettings: PlatformSettings | undefined;
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<Map<string, any>>(['sessions', 'users', 'platformSettings', 'supportTickets']);
      this.sessions = new Map(Object.entries(stored.get('sessions') || {}));
      this.users = new Map(Object.entries(stored.get('users') || {}));
      this.supportTickets = new Map(Object.entries(stored.get('supportTickets') || {}));
      this.platformSettings = stored.get('platformSettings') as PlatformSettings | undefined;
      // Seed initial users if none exist
      if (this.users.size === 0) {
        this.seedInitialUsers();
      }
      if (!this.platformSettings) {
        this.platformSettings = {
          subscriptionGateways: {
            Xendit: { name: 'Xendit', isEnabled: false, apiKey: '', apiSecret: '' },
            Midtrans: { name: 'Midtrans', isEnabled: false, apiKey: '', apiSecret: '' },
          }
        };
      }
      await this.persist();
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put({
      sessions: Object.fromEntries(this.sessions),
      users: Object.fromEntries(this.users),
      platformSettings: this.platformSettings,
      supportTickets: Object.fromEntries(this.supportTickets),
    });
  }
  private seedInitialUsers() {
    const initialUsers: ManagedUser[] = [
      { id: 'user-123', name: 'Alex Johnson', email: 'user@zenvoyer.app', passwordHash: mockHash('password'), role: 'USER', status: 'Active', createdAt: new Date('2023-01-15').toISOString(), plan: 'Pro', businessStage: 'intermediate' },
      { id: 'admin-456', name: 'Maria Garcia', email: 'admin@zenvoyer.app', passwordHash: mockHash('password'), role: 'ADMIN', status: 'Active', createdAt: new Date('2023-02-20').toISOString(), plan: 'Pro', businessStage: 'advanced' },
      { id: 'super-789', name: 'Sam Chen', email: 'super@zenvoyer.app', passwordHash: mockHash('password'), role: 'SUPER_ADMIN', status: 'Active', createdAt: new Date('2023-01-01').toISOString(), plan: 'Pro', businessStage: 'advanced' },
    ];
    initialUsers.forEach(user => this.users.set(user.id, user));
  }
  // --- User Management ---
  async addUser(userData: { name: string; email: string; password?: string }): Promise<ManagedUser> {
    await this.ensureLoaded();
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }
    const newUser: ManagedUser = {
      name: userData.name,
      email: userData.email,
      passwordHash: mockHash(userData.password || 'default_password'),
      id: uuidv4(),
      role: 'USER',
      status: 'Active',
      createdAt: new Date().toISOString(),
      plan: 'Free',
      businessStage: 'new',
    };
    this.users.set(newUser.id, newUser);
    await this.persist();
    return newUser;
  }
  async getUserByEmail(email: string): Promise<ManagedUser | undefined> {
    await this.ensureLoaded();
    return Array.from(this.users.values()).find(u => u.email === email);
  }
  async listUsers(): Promise<ManagedUser[]> {
    await this.ensureLoaded();
    return Array.from(this.users.values());
  }
  async updateUserRole(userId: string, role: UserRole): Promise<ManagedUser | null> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (user) {
      user.role = role;
      this.users.set(userId, user);
      await this.persist();
      return user;
    }
    return null;
  }
  async toggleUserStatus(userId: string): Promise<ManagedUser | null> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (user) {
      user.status = user.status === 'Active' ? 'Banned' : 'Active';
      this.users.set(userId, user);
      await this.persist();
      return user;
    }
    return null;
  }
  async updateUserPlan(userId: string, plan: 'Free' | 'Pro'): Promise<ManagedUser | null> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (user) {
      user.plan = plan;
      this.users.set(userId, user);
      await this.persist();
      return user;
    }
    return null;
  }
  async updateUserProfile(userId: string, profileData: { name: string; email: string }): Promise<ManagedUser | null> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (user) {
      user.name = profileData.name;
      user.email = profileData.email;
      this.users.set(userId, user);
      await this.persist();
      return user;
    }
    return null;
  }
  async updateUserBusinessStage(userId: string, stage: 'new' | 'intermediate' | 'advanced'): Promise<ManagedUser | null> {
    await this.ensureLoaded();
    const user = this.users.get(userId);
    if (user) {
      user.businessStage = stage;
      this.users.set(userId, user);
      await this.persist();
      return user;
    }
    return null;
  }
  // --- Platform Settings ---
  async getPlatformSettings(): Promise<PlatformSettings> {
    await this.ensureLoaded();
    return this.platformSettings!;
  }
  async updatePlatformSettings(settings: Partial<PlatformSettings>): Promise<PlatformSettings> {
    await this.ensureLoaded();
    this.platformSettings = { ...this.platformSettings!, ...settings };
    await this.persist();
    return this.platformSettings!;
  }
  // --- Support Tickets ---
  async createSupportTicket(ticketData: { userId: string; userEmail: string; subject: string; message: string }): Promise<SupportTicket> {
    await this.ensureLoaded();
    const newTicket: SupportTicket = {
      ...ticketData,
      id: `TKT-${String(this.supportTickets.size + 1).padStart(5, '0')}`,
      status: 'Open',
      priority: 'Medium',
      createdAt: new Date().toISOString(),
    };
    this.supportTickets.set(newTicket.id, newTicket);
    await this.persist();
    return newTicket;
  }
  async listSupportTickets(): Promise<SupportTicket[]> {
    await this.ensureLoaded();
    return Array.from(this.supportTickets.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async updateSupportTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<SupportTicket | null> {
    await this.ensureLoaded();
    const ticket = this.supportTickets.get(ticketId);
    if (ticket) {
      ticket.status = status;
      this.supportTickets.set(ticketId, ticket);
      await this.persist();
      return ticket;
    }
    return null;
  }
  // --- Session Management ---
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  // --- Request Handler ---
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    try {

      if (path.startsWith('/api/platform/settings')) {
        if (method === 'GET') {
          const settings = await this.getPlatformSettings();
          return Response.json({ success: true, data: settings });
        }
        if (method === 'PUT') {
          const body = await request.json<Partial<PlatformSettings>>();
          const settings = await this.updatePlatformSettings(body);
          return Response.json({ success: true, data: settings });
        }
      }
      if (path.startsWith('/api/support/tickets')) {
        if (method === 'GET') {
          const tickets = await this.listSupportTickets();
          return Response.json({ success: true, data: tickets });
        }
        if (method === 'POST') {
          const body = await request.json<{ userId: string; userEmail: string; subject: string; message: string }>();
          const ticket = await this.createSupportTicket(body);
          return Response.json({ success: true, data: ticket });
        }
        const ticketId = path.split('/')[4]; // /api/support/tickets/:id/status
        if (ticketId && path.endsWith('/status')) {
          if (method === 'PUT') {
            const { status } = await request.json<{ status: SupportTicketStatus }>();
            const updatedTicket = await this.updateSupportTicketStatus(ticketId, status);
            if (updatedTicket) return Response.json({ success: true, data: updatedTicket });
            return Response.json({ success: false, error: 'Ticket not found' }, { status: 404 });
          }
        }
      }
      if (path.startsWith('/api/sessions')) {
        if (method === 'GET') return Response.json({ success: true, data: await this.listSessions() });
        if (method === 'POST') {
          const { sessionId, title } = await request.json<{ sessionId: string; title: string }>();
          await this.addSession(sessionId, title);
          return Response.json({ success: true });
        }
        if (method === 'DELETE') {
          const sessionId = path.split('/')[3];
          const deleted = await this.removeSession(sessionId);
          return Response.json({ success: deleted });
        }
      }
      if (path.startsWith('/api/auth/login')) {
        if (method === 'POST') {
          const { email, password } = await request.json<{ email: string; password?: string }>();
          const user = await this.getUserByEmail(email);
          if (user && user.status === 'Active' && password && mockVerify(password, user.passwordHash)) {
            return Response.json({ success: true, data: user });
          }
          // Fallback for re-auth or old email-only login
          if (user && user.status === 'Active' && !password) {
             return Response.json({ success: true, data: user });
          }
          return Response.json({ success: false, error: 'Invalid credentials or user banned.' }, { status: 401 });
        }
      }
      if (path.startsWith('/api/auth/signup')) {
        if (method === 'POST') {
          const { name, email, password } = await request.json<{ name: string; email: string; password?: string }>();
          try {
            const newUser = await this.addUser({ name, email, password });
            return Response.json({ success: true, data: newUser });
          } catch (e) {
            return Response.json({ success: false, error: (e as Error).message }, { status: 409 });
          }
        }
      }
      if (path.startsWith('/api/users')) {
        if (method === 'GET') {
          const users = await this.listUsers();
          return Response.json({ success: true, data: users });
        }
        const userId = path.split('/')[3];
        if (userId && path.endsWith('/role')) {
          if (method === 'PUT') {
            const { role } = await request.json<{ role: UserRole }>();
            const updatedUser = await this.updateUserRole(userId, role);
            if (updatedUser) return Response.json({ success: true, data: updatedUser });
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
          }
        }
        if (userId && path.endsWith('/status')) {
          if (method === 'PUT') {
            const updatedUser = await this.toggleUserStatus(userId);
            if (updatedUser) return Response.json({ success: true, data: updatedUser });
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
          }
        }
        if (userId && path.endsWith('/plan')) {
          if (method === 'PUT') {
            const { plan } = await request.json<{ plan: 'Free' | 'Pro' }>();
            const updatedUser = await this.updateUserPlan(userId, plan);
            if (updatedUser) return Response.json({ success: true, data: updatedUser });
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
          }
        }
        if (userId && path.endsWith('/profile')) {
          if (method === 'PUT') {
            const profileData = await request.json<{ name: string; email: string }>();
            const updatedUser = await this.updateUserProfile(userId, profileData);
            if (updatedUser) return Response.json({ success: true, data: updatedUser });
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
          }
        }
        if (userId && path.endsWith('/stage')) {
          if (method === 'PUT') {
            const { stage } = await request.json<{ stage: 'new' | 'intermediate' | 'advanced' }>();
            const updatedUser = await this.updateUserBusinessStage(userId, stage);
            if (updatedUser) return Response.json({ success: true, data: updatedUser });
            return Response.json({ success: false, error: 'User not found' }, { status: 404 });
          }
        }
        if (userId && path.endsWith('/stage-check')) {
          if (method === 'POST') {
            const user = this.users.get(userId);
            if (user && user.businessStage === 'new') {
              await this.updateUserBusinessStage(userId, 'intermediate');
            }
            return Response.json({ success: true });
          }
        }
      }
    } catch (e) {
      return Response.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
    return Response.json({ success: false, error: 'Not Found' }, { status: 404 });
  }
}