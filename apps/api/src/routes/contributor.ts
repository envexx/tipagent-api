import { Hono } from 'hono'
import type { Env } from '../index.js'
import { getAllActiveProjects, getTipsReceivedByUser, getReceivedTipStats, getUserById } from '../db/queries.js'

export const contributorRoute = new Hono<{ Bindings: Env }>()

// GET /explore — list all active projects that contributors can work on (excludes own projects)
contributorRoute.get('/explore', async (c) => {
  const userId = c.get('userId')
  const projects = await getAllActiveProjects(c.env.DB)
  
  // Filter out user's own projects - they can't tip themselves
  const contributableProjects = projects.filter(p => p.ownerId !== userId)
  
  // Return public info only (no wallet addresses, secrets, etc.)
  const publicProjects = contributableProjects.map(p => ({
    id: p.id,
    githubRepo: p.githubRepo,
    ownerUsername: p.ownerUsername,
    tipMinUsdt: p.tipMinUsdt,
    tipMaxUsdt: p.tipMaxUsdt,
    tasks: p.tasks || null,
    createdAt: p.createdAt
  }))
  
  return c.json({ projects: publicProjects })
})

// GET /my-tips — tips received by the current user
contributorRoute.get('/my-tips', async (c) => {
  const userId = c.get('userId')
  const user = await getUserById(c.env.DB, userId)
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  const limit = parseInt(c.req.query('limit') ?? '50')
  const tips = await getTipsReceivedByUser(c.env.DB, user.githubUsername, limit)
  
  return c.json({ 
    tips: tips.results?.map((t: any) => ({
      id: t.id,
      projectId: t.project_id,
      githubRepo: t.github_repo,
      eventType: t.event_type,
      amountUsdt: t.amount_usdt,
      status: t.status,
      txHash: t.tx_hash,
      reasoning: t.reasoning,
      createdAt: t.created_at,
      confirmedAt: t.confirmed_at
    })) ?? []
  })
})

// GET /my-tips/stats — stats for tips received by current user
contributorRoute.get('/my-tips/stats', async (c) => {
  const userId = c.get('userId')
  const user = await getUserById(c.env.DB, userId)
  
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  
  const stats = await getReceivedTipStats(c.env.DB, user.githubUsername)
  return c.json(stats)
})
