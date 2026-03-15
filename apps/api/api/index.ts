import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { githubRoute } from '../src/routes/webhooks/github'
import { discordRoute } from '../src/routes/webhooks/discord'
import { customRoute } from '../src/routes/webhooks/custom'
import { authRoute } from '../src/routes/auth'
import { projectsRoute } from '../src/routes/projects'
import { tipsRoute } from '../src/routes/tips'
import { healthRoute } from '../src/routes/health'
import { userRoute } from '../src/routes/user'
import { contributorRoute } from '../src/routes/contributor'
import { sessionMiddleware } from '../src/middleware/session'

export type Env = {
  DB: any
  TIP_QUEUE: any
  // AI & Blockchain
  GEMINI_API_KEY: string
  WDK_MASTER_SEED: string
  BASE_RPC_URL: string
  POLYGON_RPC_URL: string
  // GitHub OAuth
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_TOKEN: string
  // Discord
  DISCORD_BOT_TOKEN: string
  DISCORD_WEBHOOK_SECRET: string
  // URLs
  API_URL: string
  FRONTEND_URL: string
  // Runtime config
  ENVIRONMENT: string
  PRIMARY_CHAIN: string
  LIQUID_RESERVE_USDT: string
  YIELD_ENABLED: string
}

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.use('*', logger())
app.use('*', cors({ 
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true 
}))

// Public routes
app.route('/auth', authRoute)
app.route('/webhooks/github', githubRoute)
app.route('/webhooks/discord', discordRoute)
app.route('/webhooks/custom', customRoute)
app.route('/health', healthRoute)

// Protected routes
app.use('/projects/*', sessionMiddleware)
app.use('/tips/*', sessionMiddleware)
app.use('/user/*', sessionMiddleware)
app.use('/contributor/*', sessionMiddleware)

app.route('/projects', projectsRoute)
app.route('/tips', tipsRoute)
app.route('/user', userRoute)
app.route('/contributor', contributorRoute)

app.get('/', (c) => c.json({ 
  name: 'TipAgent API',
  version: '1.0.0',
  docs: 'https://github.com/envexx/tipagent-api'
}))

export default handle(app)
