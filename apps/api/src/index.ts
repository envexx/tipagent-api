import { Hono }             from 'hono'
import { cors }             from 'hono/cors'
import { logger }           from 'hono/logger'
import { githubRoute }      from './routes/webhooks/github'
import { discordRoute }     from './routes/webhooks/discord'
import { customRoute }      from './routes/webhooks/custom'
import { authRoute }        from './routes/auth'
import { projectsRoute }    from './routes/projects'
import { tipsRoute }        from './routes/tips'
import { healthRoute }      from './routes/health'
import { userRoute }        from './routes/user'
import { contributorRoute } from './routes/contributor'
import { sessionMiddleware } from './middleware/session'
import { processQueueMessage, type QueueMessage } from './queue/processor'
import { runYieldOptimizer } from './jobs/yieldOptimizer'

export type Env = {
  DB: D1Database; TIP_QUEUE: Queue<QueueMessage>
  // AI & Blockchain
  GEMINI_API_KEY: string; WDK_MASTER_SEED: string
  BASE_RPC_URL: string; POLYGON_RPC_URL: string
  // GitHub OAuth (for user login)
  GITHUB_CLIENT_ID: string; GITHUB_CLIENT_SECRET: string
  GITHUB_TOKEN: string  // For posting comments
  // Discord
  DISCORD_BOT_TOKEN: string; DISCORD_WEBHOOK_SECRET: string
  // URLs
  API_URL: string; FRONTEND_URL: string
  // Runtime config
  ENVIRONMENT: string; PRIMARY_CHAIN: string
  LIQUID_RESERVE_USDT: string; YIELD_ENABLED: string
}

const app = new Hono<{ Bindings: Env }>()
app.use('*', logger())
app.use('*', cors({ 
  origin: (origin) => origin || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true 
}))

// Public routes
app.route('/auth', authRoute)
app.route('/health', healthRoute)
app.route('/webhooks/github', githubRoute)
app.route('/webhooks/discord', discordRoute)
app.route('/webhooks/custom', customRoute)

// Protected routes (require session)
app.use('/api/*', sessionMiddleware)
app.route('/api/user', userRoute)
app.route('/api/projects', projectsRoute)
app.route('/api/tips', tipsRoute)
app.route('/api/contributor', contributorRoute)

export default {
  fetch: app.fetch,
  async queue(batch: MessageBatch<QueueMessage>, env: Env) {
    for (const msg of batch.messages) {
      try { await processQueueMessage(msg.body, env); msg.ack() }
      catch (e) { console.error("[Queue]", e); msg.retry() }
    }
  },
  async scheduled(_: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runYieldOptimizer(env))
  },
}
