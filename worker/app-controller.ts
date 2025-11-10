import { DurableObject } from 'cloudflare:workers';
import { v4 as uuidv4 } from 'uuid';
import type { SessionInfo, ManagedUser, UserRole } from './types';
import type { Env } from './core-utils';
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private users = new Map<string, ManagedUser>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<Map<string, any>>(['sessions', 'users']);
      this.sessions = new Map(Object.entries(stored.get('sessions') || {}));
      this.users = new Map(Object.entries(stored.get('users') || {}));
      // Seed initial users if none exist
      if (this.users.size === 0) {
        this.seedInitialUsers();
        await this.persist();
      }
      this.loaded = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put({
      sessions: Object.fromEntries(this.sessions),
      users: Object.fromEntries(this.users),
    });
  }
  private seedInitialUsers() {
    const initialUsers: ManagedUser[] = [
      { id: 'user-123', name: 'Alex Johnson', email: 'user@zenitho.app', role: 'USER', status: 'Active', createdAt: new Date('2023-01-15').toISOString(), plan: 'Pro' },
      { id: 'admin-456', name: 'Maria Garcia', email: 'admin@zenitho.app', role: 'ADMIN', status: 'Active', createdAt: new Date('2023-02-20').toISOString(), plan: 'Pro' },
      { id: 'super-789', name: 'Sam Chen', email: 'super@zenitho.app', role: 'SUPER_ADMIN', status: 'Active', createdAt: new Date('2023-01-01').toISOString(), plan: 'Pro' },
    ];
    initialUsers.forEach(user => this.users.set(user.id, user));
  }
  // --- User Management ---
  async addUser(userData: { name: string; email: string }): Promise<ManagedUser> {
    await this.ensureLoaded();
    const existingUser = Array.from(this.users.values()).find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists.');
    }
    const newUser: ManagedUser = {
      ...userData,
      id: uuidv4(),
      role: 'USER',
      status: 'Active',
      createdAt: new Date().toISOString(),
      plan: 'Free',
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
      if (path.startsWith('/sessions')) {
        if (method === 'GET') return Response.json({ success: true, data: await this.listSessions() });
        if (method === 'POST') {
          const { sessionId, title } = await request.json<{ sessionId: string; title: string }>();
          await this.addSession(sessionId, title);
          return Response.json({ success: true });
        }
        if (method === 'DELETE') {
          const sessionId = path.split('/')[2];
          const deleted = await this.removeSession(sessionId);
          return Response.json({ success: deleted });
        }
      }
      if (path.startsWith('/auth/login')) {
        if (method === 'POST') {
          const { email } = await request.json<{ email: string }>();
          const user = await this.getUserByEmail(email);
          if (user && user.status === 'Active') {
            return Response.json({ success: true, data: user });
          }
          return Response.json({ success: false, error: 'Invalid credentials or user banned.' }, { status: 401 });
        }
      }
      if (path.startsWith('/auth/signup')) {
        if (method === 'POST') {
          const { name, email } = await request.json<{ name: string; email: string }>();
          try {
            const newUser = await this.addUser({ name, email });
            return Response.json({ success: true, data: newUser });
          } catch (e) {
            return Response.json({ success: false, error: (e as Error).message }, { status: 409 });
          }
        }
      }
      if (path.startsWith('/users')) {
        if (method === 'GET') {
          const users = await this.listUsers();
          return Response.json({ success: true, data: users });
        }
        const userId = path.split('/')[2];
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
      }
    } catch (e) {
      return Response.json({ success: false, error: (e as Error).message }, { status: 500 });
    }
    return Response.json({ success: false, error: 'Not Found' }, { status: 404 });
  }
}