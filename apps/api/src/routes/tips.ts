import { Hono } from 'hono'
import type { Env } from '../index.js'
import { getTipStats, getRecentTips, getProjectsByOwner, getProjectTreasury } from '../db/queries.js'

export const tipsRoute = new Hono<{ Bindings: Env }>()

// GET / — recent tips for user's projects
tipsRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
  const limit = parseInt(c.req.query('limit') ?? '20')
  
  // If projectId specified, verify ownership
  if (projectId) {
    const projects = await getProjectsByOwner(c.env.DB, userId)
    if (!projects.some(p => p.id === projectId)) {
      return c.json({ error: 'Not authorized to view this project' }, 403)
    }
    const tips = await getRecentTips(c.env.DB, projectId, limit)
    return c.json({ data: tips.results })
  }
  
  // Get tips for all user's projects
  const projects = await getProjectsByOwner(c.env.DB, userId)
  const projectIds = projects.map(p => p.id)
  
  if (projectIds.length === 0) {
    return c.json({ data: [] })
  }
  
  const tips = await c.env.DB.tipHistory.findMany({
    where: { projectId: { in: projectIds } },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
  
  return c.json({ data: tips })
})

// GET /stats — aggregate stats for user's projects
tipsRoute.get('/stats', async (c) => {
  const userId = c.get('userId')
  const projectId = c.req.query('projectId') ? parseInt(c.req.query('projectId')!) : undefined
  
  if (projectId) {
    const projects = await getProjectsByOwner(c.env.DB, userId)
    if (!projects.some(p => p.id === projectId)) {
      return c.json({ error: 'Not authorized' }, 403)
    }
    const stats = await getTipStats(c.env.DB, projectId)
    return c.json(stats)
  }
  
  // Aggregate stats for all user's projects
  const projects = await getProjectsByOwner(c.env.DB, userId)
  const projectIds = projects.map(p => p.id)
  
  if (projectIds.length === 0) {
    return c.json({ totalTips: 0, totalUsdt: 0, todayTips: 0, activeUsers: 0 })
  }
  
  // Get all confirmed tips for these projects
  const allTips = await c.env.DB.tipHistory.findMany({
    where: { projectId: { in: projectIds }, status: 'confirmed' },
    select: { amountUsdt: true, recipientId: true, createdAt: true }
  })
  
  const totalUsdt = allTips.reduce((sum: number, t: { amountUsdt: string }) => sum + parseFloat(t.amountUsdt), 0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = BigInt(today.getTime())
  const todayTips = allTips.filter((t: { createdAt: bigint }) => t.createdAt >= todayStart).length
  
  const uniqueUsers = new Set(allTips.map((t: { recipientId: string }) => t.recipientId))
  
  return c.json({
    totalTips: allTips.length,
    totalUsdt,
    todayTips,
    activeUsers: uniqueUsers.size
  })
})

// GET /treasury/:projectId — treasury for a specific project
tipsRoute.get('/treasury/:projectId', async (c) => {
  const userId = c.get('userId')
  const projectId = parseInt(c.req.param('projectId'))
  
  const projects = await getProjectsByOwner(c.env.DB, userId)
  if (!projects.some(p => p.id === projectId)) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  const treasury = await getProjectTreasury(c.env.DB, projectId)
  if (!treasury) {
    return c.json({ error: 'Treasury not found' }, 404)
  }
  
  return c.json({
    balanceUsdt: parseFloat(treasury.balanceUsdt),
    aaveUsdt: parseFloat(treasury.aaveUsdt),
    totalDeposited: parseFloat(treasury.totalDeposited),
    totalTipped: parseFloat(treasury.totalTipped)
  })
})
