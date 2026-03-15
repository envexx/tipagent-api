/**
 * Node.js server entry point
 * Uses @hono/node-server for HTTP handling
 * Loads env from .dev.vars
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
// Load .dev.vars file
config({ path: resolve(__dirname, '../.dev.vars') })

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { initDb } from './lib/db.js'
import { tipQueue } from './lib/queue.js'
import { scheduleCron } from './lib/cron.js'
import { getEnv, type Env } from './env.js'

import { githubRoute } from './routes/webhooks/github.js'
import { discordRoute } from './routes/webhooks/discord.js'
import { customRoute } from './routes/webhooks/custom.js'
import { authRoute } from './routes/auth.js'
import { projectsRoute } from './routes/projects.js'
import { tipsRoute } from './routes/tips.js'
import { healthRoute } from './routes/health.js'
import { userRoute } from './routes/user.js'
import { contributorRoute } from './routes/contributor.js'
import { sessionMiddleware } from './middleware/session.js'
import { processQueueMessage } from './queue/processor.js'
import { runYieldOptimizer } from './jobs/yieldOptimizer.js'

// Initialize database
initDb()

// Get environment
const env = getEnv()

// Setup queue handler
tipQueue.setHandler(async (msg) => {
  await processQueueMessage(msg, env)
})

// Setup cron jobs (every 30 minutes for yield optimizer)
scheduleCron('*/30 * * * *', async () => {
  await runYieldOptimizer(env)
}, 'YieldOptimizer')

// Create Hono app with env bindings
const app = new Hono<{ Bindings: Env }>()

// Middleware to inject env into context
app.use('*', async (c, next) => {
  // @ts-ignore - inject env bindings
  c.env = env
  await next()
})

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

// Start server
const port = parseInt(process.env.PORT || '3000')
console.log(`[Server] Starting on port ${port}...`)

serve({
  fetch: app.fetch,
  port,
}, (info: { port: number }) => {
  console.log(`[Server] Running at http://localhost:${info.port}`)
})
