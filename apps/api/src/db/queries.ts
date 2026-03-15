import type { D1Database } from '@cloudflare/workers-types'
import type { TipEvent, User, Project, ProjectTreasury } from '@tipagent/shared'

// ══════════════════════════════════════════════════════════════════
// USER QUERIES
// ══════════════════════════════════════════════════════════════════

export async function getUserByGithubId(db: D1Database, githubId: string): Promise<User | null> {
  const r = await db.prepare('SELECT * FROM users WHERE github_id=?').bind(githubId).first()
  return r ? mapUser(r) : null
}

export async function getUserById(db: D1Database, id: number): Promise<User | null> {
  const r = await db.prepare('SELECT * FROM users WHERE id=?').bind(id).first()
  return r ? mapUser(r) : null
}

export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
  const r = await db.prepare('SELECT * FROM users WHERE github_username=?').bind(username).first()
  return r ? mapUser(r) : null
}

export async function createUser(db: D1Database, data: {
  githubId: string; githubUsername: string; githubToken?: string; displayName?: string; avatarUrl?: string
}): Promise<number> {
  const now = Date.now()
  const res = await db.prepare(
    'INSERT INTO users(github_id,github_username,github_token,display_name,avatar_url,created_at,updated_at) VALUES(?,?,?,?,?,?,?)'
  ).bind(data.githubId, data.githubUsername, data.githubToken ?? null, data.displayName ?? null, data.avatarUrl ?? null, now, now).run()
  return res.meta.last_row_id as number
}

export async function updateUserWallet(db: D1Database, userId: number, walletAddr: string, chain = 'base') {
  await db.prepare('UPDATE users SET wallet_addr=?,chain=?,updated_at=? WHERE id=?')
    .bind(walletAddr, chain, Date.now(), userId).run()
}

export async function updateUserGithubToken(db: D1Database, userId: number, githubToken: string) {
  await db.prepare('UPDATE users SET github_token=?,updated_at=? WHERE id=?')
    .bind(githubToken, Date.now(), userId).run()
}

export async function getUserGithubToken(db: D1Database, userId: number): Promise<string | null> {
  const r = await db.prepare('SELECT github_token FROM users WHERE id=?').bind(userId).first<{ github_token: string | null }>()
  return r?.github_token ?? null
}

function mapUser(r: any): User {
  return {
    id: r.id, githubId: r.github_id, githubUsername: r.github_username,
    displayName: r.display_name, avatarUrl: r.avatar_url, walletAddr: r.wallet_addr,
    chain: r.chain, createdAt: r.created_at, updatedAt: r.updated_at
  }
}

// ══════════════════════════════════════════════════════════════════
// PROJECT QUERIES
// ══════════════════════════════════════════════════════════════════

export async function getProjectByRepo(db: D1Database, githubRepo: string): Promise<Project | null> {
  const r = await db.prepare('SELECT * FROM projects WHERE github_repo=?').bind(githubRepo).first()
  return r ? mapProject(r) : null
}

export async function getProjectById(db: D1Database, id: number): Promise<Project | null> {
  const r = await db.prepare('SELECT * FROM projects WHERE id=?').bind(id).first()
  return r ? mapProject(r) : null
}

export async function getProjectByWebhookSecret(db: D1Database, webhookSecret: string): Promise<Project | null> {
  const r = await db.prepare('SELECT * FROM projects WHERE webhook_secret=?').bind(webhookSecret).first()
  return r ? mapProject(r) : null
}

export async function getProjectsByOwner(db: D1Database, ownerId: number): Promise<Project[]> {
  const res = await db.prepare('SELECT * FROM projects WHERE owner_id=? ORDER BY created_at DESC').bind(ownerId).all()
  return (res.results || []).map(mapProject)
}

export async function createProject(db: D1Database, data: {
  ownerId: number; githubRepo: string; webhookSecret: string; walletAddress: string
  tipMinUsdt?: string; tipMaxUsdt?: string; dailyCap?: string; cooldownHours?: string
}): Promise<number> {
  const now = Date.now()
  const res = await db.prepare(
    `INSERT INTO projects(owner_id,github_repo,webhook_secret,wallet_address,tip_min_usdt,tip_max_usdt,daily_cap,cooldown_hours,created_at,updated_at) 
     VALUES(?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    data.ownerId, data.githubRepo, data.webhookSecret, data.walletAddress,
    data.tipMinUsdt ?? '0.5', data.tipMaxUsdt ?? '50', data.dailyCap ?? '100', data.cooldownHours ?? '1',
    now, now
  ).run()
  const projectId = res.meta.last_row_id as number
  // Create treasury for project
  await db.prepare('INSERT INTO project_treasuries(project_id,updated_at) VALUES(?,?)').bind(projectId, now).run()
  return projectId
}

export async function updateProjectRules(db: D1Database, projectId: number, rules: {
  tipMinUsdt?: string; tipMaxUsdt?: string; dailyCap?: string; cooldownHours?: string; isActive?: boolean; tasks?: string
}) {
  const sets: string[] = ['updated_at=?']
  const vals: any[] = [Date.now()]
  if (rules.tipMinUsdt !== undefined) { sets.push('tip_min_usdt=?'); vals.push(rules.tipMinUsdt) }
  if (rules.tipMaxUsdt !== undefined) { sets.push('tip_max_usdt=?'); vals.push(rules.tipMaxUsdt) }
  if (rules.dailyCap !== undefined) { sets.push('daily_cap=?'); vals.push(rules.dailyCap) }
  if (rules.cooldownHours !== undefined) { sets.push('cooldown_hours=?'); vals.push(rules.cooldownHours) }
  if (rules.isActive !== undefined) { sets.push('is_active=?'); vals.push(rules.isActive ? 1 : 0) }
  if (rules.tasks !== undefined) { sets.push('tasks=?'); vals.push(rules.tasks) }
  vals.push(projectId)
  await db.prepare(`UPDATE projects SET ${sets.join(',')} WHERE id=?`).bind(...vals).run()
}

function mapProject(r: any): Project {
  return {
    id: r.id, ownerId: r.owner_id, githubRepo: r.github_repo, webhookSecret: r.webhook_secret,
    walletAddress: r.wallet_address, isActive: r.is_active === 1, tipMinUsdt: r.tip_min_usdt, 
    tipMaxUsdt: r.tip_max_usdt, dailyCap: r.daily_cap, cooldownHours: r.cooldown_hours,
    tasks: r.tasks || null,
    createdAt: r.created_at, updatedAt: r.updated_at
  }
}

// ══════════════════════════════════════════════════════════════════
// TREASURY QUERIES
// ══════════════════════════════════════════════════════════════════

export async function getProjectTreasury(db: D1Database, projectId: number): Promise<ProjectTreasury | null> {
  const r = await db.prepare('SELECT * FROM project_treasuries WHERE project_id=?').bind(projectId).first()
  return r ? {
    id: r.id as number, projectId: r.project_id as number, balanceUsdt: r.balance_usdt as string,
    aaveUsdt: r.aave_usdt as string, totalDeposited: r.total_deposited as string,
    totalTipped: r.total_tipped as string, updatedAt: r.updated_at as number
  } : null
}

export async function updateTreasuryBalance(db: D1Database, projectId: number, balanceUsdt: string, aaveUsdt?: string) {
  if (aaveUsdt !== undefined) {
    await db.prepare('UPDATE project_treasuries SET balance_usdt=?,aave_usdt=?,updated_at=? WHERE project_id=?')
      .bind(balanceUsdt, aaveUsdt, Date.now(), projectId).run()
  } else {
    await db.prepare('UPDATE project_treasuries SET balance_usdt=?,updated_at=? WHERE project_id=?')
      .bind(balanceUsdt, Date.now(), projectId).run()
  }
}

export async function recordDeposit(db: D1Database, projectId: number, amountUsdt: string, txHash: string, fromAddr: string) {
  const now = Date.now()
  await db.prepare('INSERT INTO deposits(project_id,amount_usdt,tx_hash,from_addr,status,created_at) VALUES(?,?,?,?,?,?)')
    .bind(projectId, amountUsdt, txHash, fromAddr, 'pending', now).run()
}

export async function confirmDeposit(db: D1Database, txHash: string) {
  const now = Date.now()
  const dep = await db.prepare('SELECT * FROM deposits WHERE tx_hash=?').bind(txHash).first()
  if (!dep) return
  await db.prepare('UPDATE deposits SET status=?,confirmed_at=? WHERE tx_hash=?').bind('confirmed', now, txHash).run()
  // Update treasury balance
  const treasury = await getProjectTreasury(db, dep.project_id as number)
  if (treasury) {
    const newBalance = (parseFloat(treasury.balanceUsdt) + parseFloat(dep.amount_usdt as string)).toString()
    const newTotal = (parseFloat(treasury.totalDeposited) + parseFloat(dep.amount_usdt as string)).toString()
    await db.prepare('UPDATE project_treasuries SET balance_usdt=?,total_deposited=?,updated_at=? WHERE project_id=?')
      .bind(newBalance, newTotal, now, dep.project_id).run()
  }
}

// ══════════════════════════════════════════════════════════════════
// RATE LIMITS
// ══════════════════════════════════════════════════════════════════

export async function getRateLimit(db: D1Database, key: string): Promise<string | null> {
  const r = await db.prepare('SELECT value FROM rate_limits WHERE key=? AND expires_at>?')
    .bind(key, Date.now()).first<{ value: string }>()
  return r?.value ?? null
}

export async function setRateLimit(db: D1Database, key: string, value: string, ttlMs: number) {
  const exp = Date.now() + ttlMs
  await db.prepare('INSERT INTO rate_limits(key,value,expires_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,expires_at=excluded.expires_at')
    .bind(key, value, exp).run()
}

export async function cleanExpiredRateLimits(db: D1Database) {
  await db.prepare('DELETE FROM rate_limits WHERE expires_at<?').bind(Date.now()).run()
}

// ══════════════════════════════════════════════════════════════════
// TIP HISTORY (Multi-tenant)
// ══════════════════════════════════════════════════════════════════

export async function saveTipHistory(db: D1Database, a: {
  projectId: number; eventId: string; event: TipEvent; recipientAddr: string
  amountUsdt: number; reasoning: string; status?: string
}) {
  await db.prepare(
    'INSERT INTO tip_history(project_id,event_id,source,event_type,recipient_id,recipient_addr,amount_usdt,reasoning,chain,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)'
  ).bind(
    a.projectId, a.eventId, a.event.source, a.event.eventType, a.event.recipient.id,
    a.recipientAddr, a.amountUsdt.toString(), a.reasoning, 'base', a.status ?? 'pending', Date.now()
  ).run()
  // Update treasury total_tipped
  const treasury = await getProjectTreasury(db, a.projectId)
  if (treasury) {
    const newTipped = (parseFloat(treasury.totalTipped) + a.amountUsdt).toString()
    const newBalance = (parseFloat(treasury.balanceUsdt) - a.amountUsdt).toString()
    await db.prepare('UPDATE project_treasuries SET total_tipped=?,balance_usdt=?,updated_at=? WHERE project_id=?')
      .bind(newTipped, newBalance, Date.now(), a.projectId).run()
  }
}

export async function updateTipStatus(db: D1Database, eventId: string, status: 'confirmed' | 'failed', txHash?: string, err?: string) {
  await db.prepare('UPDATE tip_history SET status=?,tx_hash=?,error_msg=?,confirmed_at=? WHERE event_id=?')
    .bind(status, txHash ?? null, err ?? null, Date.now(), eventId).run()
}

export async function saveAuditLog(db: D1Database, a: { projectId?: number; eventId: string; event: TipEvent; result: string; reason?: string }) {
  await db.prepare('INSERT INTO event_audit(project_id,event_id,source,event_type,result,reject_reason,raw_payload,created_at) VALUES(?,?,?,?,?,?,?,?)')
    .bind(a.projectId ?? null, a.eventId, a.event.source, a.event.eventType, a.result, a.reason ?? null, JSON.stringify(a.event.rawPayload), Date.now()).run()
}

export async function getRecentTips(db: D1Database, projectId?: number, limit = 20) {
  if (projectId) {
    return db.prepare('SELECT * FROM tip_history WHERE project_id=? ORDER BY created_at DESC LIMIT ?').bind(projectId, limit).all()
  }
  return db.prepare('SELECT * FROM tip_history ORDER BY created_at DESC LIMIT ?').bind(limit).all()
}

export async function getTipStats(db: D1Database, projectId?: number) {
  const where = projectId ? 'WHERE project_id=? AND status="confirmed"' : 'WHERE status="confirmed"'
  const binds = projectId ? [projectId] : []
  
  const tot = await db.prepare(`SELECT COUNT(*) as c, COALESCE(SUM(CAST(amount_usdt AS REAL)),0) as s FROM tip_history ${where}`)
    .bind(...binds).first<{ c: number; s: number }>()
  const today = new Date().toISOString().split('T')[0]
  const todWhere = projectId ? 'WHERE project_id=? AND status="confirmed" AND created_at>?' : 'WHERE status="confirmed" AND created_at>?'
  const todBinds = projectId ? [projectId, new Date(today).getTime()] : [new Date(today).getTime()]
  const tod = await db.prepare(`SELECT COUNT(*) as c FROM tip_history ${todWhere}`).bind(...todBinds).first<{ c: number }>()
  const usrWhere = projectId ? 'WHERE project_id=? AND status="confirmed"' : 'WHERE status="confirmed"'
  const usr = await db.prepare(`SELECT COUNT(DISTINCT recipient_id) as c FROM tip_history ${usrWhere}`).bind(...binds).first<{ c: number }>()
  
  return { totalTips: tot?.c ?? 0, totalUsdt: tot?.s ?? 0, todayTips: tod?.c ?? 0, activeUsers: usr?.c ?? 0 }
}

export async function saveTreasurySnapshot(db: D1Database, a: { projectId: number; liquidUsdt: number; aaveUsdt: number; aaveApy?: string }) {
  await db.prepare('INSERT INTO treasury_snapshots(project_id,liquid_usdt,aave_usdt,total_usdt,aave_apy,snapshot_at) VALUES(?,?,?,?,?,?)')
    .bind(a.projectId, a.liquidUsdt.toString(), a.aaveUsdt.toString(), (a.liquidUsdt + a.aaveUsdt).toString(), a.aaveApy ?? null, Date.now()).run()
}

// ══════════════════════════════════════════════════════════════════
// SESSION QUERIES
// ══════════════════════════════════════════════════════════════════

export async function createSession(db: D1Database, userId: number, expiresInMs = 7 * 24 * 60 * 60 * 1000): Promise<string> {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db.prepare('INSERT INTO sessions(id,user_id,expires_at,created_at) VALUES(?,?,?,?)')
    .bind(id, userId, now + expiresInMs, now).run()
  return id
}

export async function getSession(db: D1Database, sessionId: string): Promise<{ userId: number } | null> {
  const r = await db.prepare('SELECT user_id FROM sessions WHERE id=? AND expires_at>?')
    .bind(sessionId, Date.now()).first<{ user_id: number }>()
  return r ? { userId: r.user_id } : null
}

export async function deleteSession(db: D1Database, sessionId: string) {
  await db.prepare('DELETE FROM sessions WHERE id=?').bind(sessionId).run()
}

export async function cleanExpiredSessions(db: D1Database) {
  await db.prepare('DELETE FROM sessions WHERE expires_at<?').bind(Date.now()).run()
}

// ══════════════════════════════════════════════════════════════════
// CONTRIBUTOR QUERIES (for tip receivers)
// ══════════════════════════════════════════════════════════════════

export async function getAllActiveProjects(db: D1Database): Promise<(Project & { ownerUsername: string })[]> {
  const res = await db.prepare(`
    SELECT p.*, u.github_username as owner_username 
    FROM projects p 
    JOIN users u ON p.owner_id = u.id 
    WHERE p.is_active = 1 
    ORDER BY p.created_at DESC
  `).all()
  return (res.results || []).map(r => ({
    ...mapProject(r),
    ownerUsername: r.owner_username as string
  }))
}

export async function getTipsReceivedByUser(db: D1Database, githubUsername: string, limit = 50) {
  return db.prepare(`
    SELECT th.*, p.github_repo 
    FROM tip_history th
    JOIN projects p ON th.project_id = p.id
    WHERE th.recipient_id = ? 
    ORDER BY th.created_at DESC 
    LIMIT ?
  `).bind(githubUsername, limit).all()
}

export async function getReceivedTipStats(db: D1Database, githubUsername: string) {
  const tot = await db.prepare(`
    SELECT COUNT(*) as c, COALESCE(SUM(CAST(amount_usdt AS REAL)),0) as s 
    FROM tip_history 
    WHERE recipient_id = ? AND status = 'confirmed'
  `).bind(githubUsername).first<{ c: number; s: number }>()
  
  const pending = await db.prepare(`
    SELECT COUNT(*) as c, COALESCE(SUM(CAST(amount_usdt AS REAL)),0) as s 
    FROM tip_history 
    WHERE recipient_id = ? AND status = 'pending'
  `).bind(githubUsername).first<{ c: number; s: number }>()
  
  const projects = await db.prepare(`
    SELECT COUNT(DISTINCT project_id) as c 
    FROM tip_history 
    WHERE recipient_id = ? AND status = 'confirmed'
  `).bind(githubUsername).first<{ c: number }>()
  
  return {
    totalTips: tot?.c ?? 0,
    totalUsdt: tot?.s ?? 0,
    pendingTips: pending?.c ?? 0,
    pendingUsdt: pending?.s ?? 0,
    projectsContributed: projects?.c ?? 0
  }
}
