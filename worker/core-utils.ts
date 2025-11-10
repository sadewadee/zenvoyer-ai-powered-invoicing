/**
 * Core utilities for the Cloudflare Agents template
 * STRICTLY DO NOT MODIFY THIS FILE - Hidden from AI to prevent breaking core functionality
 */
import type { AppController } from './app-controller';
import type { ChatAgent } from './agent';
import { BusinessAgent } from './business-agent';
export interface Env {
    CF_AI_BASE_URL: string;
    CF_AI_API_KEY: string;
    SERPAPI_KEY: string;
    OPENROUTER_API_KEY: string;
    CHAT_AGENT: DurableObjectNamespace<ChatAgent>;
    APP_CONTROLLER: DurableObjectNamespace<AppController>;
    BUSINESS_AGENT: DurableObjectNamespace<BusinessAgent>;
}
/**
 * Get AppController stub for session management
 * Uses a singleton pattern with fixed ID for consistent routing
 */
export function getAppController(env: Env): DurableObjectStub<AppController> {
  const id = env.APP_CONTROLLER.idFromName("controller");
  return env.APP_CONTROLLER.get(id);
}
/**
 * Register a new chat session with the control plane
 * Called automatically when a new ChatAgent is created
 */
export async function registerSession(env: Env, sessionId: string, title?: string): Promise<void> {
  try {
    const controller = getAppController(env);
    await controller.fetch(new Request(`https://.../sessions`, {
      method: 'POST',
      body: JSON.stringify({ sessionId, title }),
      headers: { 'Content-Type': 'application/json' },
    }));
  } catch (error) {
    console.error('Failed to register session:', error);
    // Don't throw - session should work even if registration fails
  }
}
/**
 * Unregister a session from the control plane
 * Called when a session is explicitly deleted
 */
export async function unregisterSession(env: Env, sessionId: string): Promise<boolean> {
  try {
    const controller = getAppController(env);
    const response = await controller.fetch(new Request(`https://.../sessions/${sessionId}`, {
      method: 'DELETE',
    }));
    const result = await response.json<{ success: boolean }>();
    return result.success;
  } catch (error) {
    console.error('Failed to unregister session:', error);
    return false;
  }
}