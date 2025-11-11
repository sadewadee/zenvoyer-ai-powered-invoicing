import { Hono } from "hono";
import { getAgentByName } from 'agents';
import { ChatAgent } from './agent';
import { BusinessAgent } from './business-agent';
import { API_RESPONSES } from './config';
import { Env, getAppController, registerSession, unregisterSession } from "./core-utils";
const getUserId = (c: any) => 'user-123-static';
export function coreRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/chat/:sessionId/*', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const agent = await getAgentByName<Env, ChatAgent>(c.env.CHAT_AGENT, sessionId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace(`/api/chat/${sessionId}`, '');
            return agent.fetch(new Request(url.toString(), {
                method: c.req.method,
                headers: c.req.header(),
                body: c.req.method === 'GET' || c.req.method === 'DELETE' ? undefined : c.req.raw.body
            }));
        } catch (error) {
            console.error('Agent routing error:', error);
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function businessRoutes(app: Hono<{ Bindings: Env }>) {
    app.all('/api/data/*', async (c) => {
        try {
            const userId = getUserId(c);
            if (!userId) {
                return c.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
            const agent = await getAgentByName<Env, BusinessAgent>(c.env.BUSINESS_AGENT, userId);
            const url = new URL(c.req.url);
            url.pathname = url.pathname.replace('/api/data', '');
            const req = c.req.raw;
            const body = req.method === 'POST' || req.method === 'PUT' ? await req.json() : undefined;
            if (body && url.pathname === '/invoices' && req.method === 'POST') {
                body.userId = userId;
            }
            return agent.fetch(new Request(url.toString(), {
                method: req.method,
                headers: req.headers,
                body: body ? JSON.stringify(body) : undefined,
            }));
        } catch (error) {
            console.error('Business agent routing error:', error);
            return c.json({ success: false, error: API_RESPONSES.AGENT_ROUTING_FAILED }, { status: 500 });
        }
    });
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // --- Platform Settings ---
    app.get('/api/platform/settings', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/platform/settings', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    // --- Support Tickets ---
    app.get('/api/support/tickets', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.post('/api/support/tickets', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/support/tickets/:id/status', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    // --- User Auth & Management Routes ---
    app.post('/api/auth/login', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.post('/api/auth/signup', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.get('/api/users', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    // --- Debug Routes ---
    app.get('/api/debug/users', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/users/:id/role', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/users/:id/status', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/users/:id/plan', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/users/:id/profile', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.put('/api/users/:id/stage', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    // --- Session Management Routes ---
    app.get('/api/sessions', async (c) => {
        const controller = getAppController(c.env);
        return controller.fetch(c.req.raw);
    });
    app.post('/api/sessions', async (c) => {
        try {
            const body = await c.req.json().catch(() => ({}));
            const { title, sessionId: providedSessionId, firstMessage } = body;
            const sessionId = providedSessionId || crypto.randomUUID();
            let sessionTitle = title;
            if (!sessionTitle) {
                const now = new Date();
                const dateTime = now.toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
                if (firstMessage && firstMessage.trim()) {
                    const cleanMessage = firstMessage.trim().replace(/\s+/g, ' ');
                    const truncated = cleanMessage.length > 40 ? cleanMessage.slice(0, 37) + '...' : cleanMessage;
                    sessionTitle = `${truncated} • ${dateTime}`;
                } else {
                    sessionTitle = `Chat ${dateTime}`;
                }
            }
            await registerSession(c.env, sessionId, sessionTitle);
            return c.json({ success: true, data: { sessionId, title: sessionTitle } });
        } catch (error) {
            console.error('Failed to create session:', error);
            return c.json({ success: false, error: 'Failed to create session' }, { status: 500 });
        }
    });
    app.delete('/api/sessions/:sessionId', async (c) => {
        try {
            const sessionId = c.req.param('sessionId');
            const deleted = await unregisterSession(c.env, sessionId);
            if (!deleted) {
                return c.json({ success: false, error: 'Session not found' }, { status: 404 });
            }
            return c.json({ success: true, data: { deleted: true } });
        } catch (error) {
            console.error('Failed to delete session:', error);
            return c.json({ success: false, error: 'Failed to delete session' }, { status: 500 });
        }
    });
}