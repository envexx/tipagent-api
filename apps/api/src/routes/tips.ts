import { Hono } from 'hono'
import type { Env } from '../index'
import { getTipStats, getRecentTips, getProjectsByOwner, getProjectTreasury } from '../db/queries'

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
  
  const placeholders = projectIds.map(() => '?').join(',')
  const rows = await c.env.DB.prepare(
    `SELECT * FROM tip_history WHERE project_id IN (${placeholders}) ORDER BY created_at DESC LIMIT ?`
  ).bind(...projectIds, limit).all()
  
  return c.json({ data: rows.results })
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
  
  const placeholders = projectIds.map(() => '?').join(',')
  const tot = await c.env.DB.prepare(
    `SELECT COUNT(*) as c, COALESCE(SUM(CAST(amount_usdt AS REAL)),0) as s FROM tip_history WHERE project_id IN (${placeholders}) AND status='confirmed'`
  ).bind(...projectIds).first<{ c: number; s: number }>()
  
  const today = new Date().toISOString().split('T')[0]
  const tod = await c.env.DB.prepare(
    `SELECT COUNT(*) as c FROM tip_history WHERE project_id IN (${placeholders}) AND status='confirmed' AND created_at>?`
  ).bind(...projectIds, new Date(today).getTime()).first<{ c: number }>()
  
  const usr = await c.env.DB.prepare(
    `SELECT COUNT(DISTINCT recipient_id) as c FROM tip_history WHERE project_id IN (${placeholders}) AND status='confirmed'`
  ).bind(...projectIds).first<{ c: number }>()
  
  return c.json({
    totalTips: tot?.c ?? 0,
    totalUsdt: tot?.s ?? 0,
    todayTips: tod?.c ?? 0,
    activeUsers: usr?.c ?? 0
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
