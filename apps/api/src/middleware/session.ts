import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import type { Env } from '../index'
import { getSession, getUserById } from '../db/queries'
import type { User } from '@tipagent/shared'

// Extend Hono context with user
declare module 'hono' {
  interface ContextVariableMap {
    user: User
    userId: number
  }
}

export const sessionMiddleware: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  // Try cookie first, then Authorization header (for cross-domain)
  let sessionId = getCookie(c, 'session')
  
  if (!sessionId) {
    const authHeader = c.req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      sessionId = authHeader.slice(7)
    }
  }
  
  if (!sessionId) {
    return c.json({ error: 'Unauthorized - Please login' }, 401)
  }
  
  const session = await getSession(c.env.DB, sessionId)
  if (!session) {
    return c.json({ error: 'Session expired - Please login again' }, 401)
  }
  
  const user = await getUserById(c.env.DB, session.userId)
  if (!user) {
    return c.json({ error: 'User not found' }, 401)
  }
  
  // Set user in context for downstream handlers
  c.set('user', user)
  c.set('userId', user.id)
  
  await next()
}
