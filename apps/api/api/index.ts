import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Simple Vercel serverless function for TipAgent API
// Full API runs on Cloudflare Workers with WDK integration

const app = new Hono()

app.use('*', cors({ 
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true 
}))

app.get('/', (c) => c.json({ 
  name: 'TipAgent API',
  version: '1.0.0',
  status: 'online',
  docs: 'https://github.com/envexx/tipagent-api',
  note: 'Full API with WDK integration runs on Cloudflare Workers'
}))

app.get('/health', (c) => c.json({ 
  ok: true,
  env: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
}))

export default handle(app)
