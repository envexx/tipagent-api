import type { PrismaClient } from '@prisma/client'
import type { TipEvent, User, Project, ProjectTreasury } from '@tipagent/shared'

// ══════════════════════════════════════════════════════════════════
// USER QUERIES
// ══════════════════════════════════════════════════════════════════

export async function getUserByGithubId(db: PrismaClient, githubId: string): Promise<User | null> {
  const r = await db.user.findUnique({ where: { githubId } })
  return r ? mapUser(r) : null
}

export async function getUserById(db: PrismaClient, id: number): Promise<User | null> {
  const r = await db.user.findUnique({ where: { id } })
  return r ? mapUser(r) : null
}

export async function getUserByUsername(db: PrismaClient, username: string): Promise<User | null> {
  const r = await db.user.findFirst({ where: { githubUsername: username } })
  return r ? mapUser(r) : null
}

export async function createUser(db: PrismaClient, data: {
  githubId: string; githubUsername: string; githubToken?: string; displayName?: string; avatarUrl?: string
}): Promise<number> {
  const now = BigInt(Date.now())
  const user = await db.user.create({
    data: {
      githubId: data.githubId,
      githubUsername: data.githubUsername,
      githubToken: data.githubToken ?? null,
      displayName: data.displayName ?? null,
      avatarUrl: data.avatarUrl ?? null,
      createdAt: now,
      updatedAt: now
    }
  })
  return user.id
}

export async function updateUserWallet(db: PrismaClient, userId: number, walletAddr: string, chain = 'base') {
  await db.user.update({
    where: { id: userId },
    data: { walletAddr, chain, updatedAt: BigInt(Date.now()) }
  })
}

export async function updateUserGithubToken(db: PrismaClient, userId: number, githubToken: string) {
  await db.user.update({
    where: { id: userId },
    data: { githubToken, updatedAt: BigInt(Date.now()) }
  })
}

export async function getUserGithubToken(db: PrismaClient, userId: number): Promise<string | null> {
  const r = await db.user.findUnique({ where: { id: userId }, select: { githubToken: true } })
  return r?.githubToken ?? null
}

function mapUser(r: any): User {
  return {
    id: r.id, githubId: r.githubId, githubUsername: r.githubUsername,
    displayName: r.displayName, avatarUrl: r.avatarUrl, walletAddr: r.walletAddr,
    chain: r.chain, createdAt: Number(r.createdAt), updatedAt: Number(r.updatedAt)
  }
}

// ══════════════════════════════════════════════════════════════════
// PROJECT QUERIES
// ══════════════════════════════════════════════════════════════════

export async function getProjectByRepo(db: PrismaClient, githubRepo: string): Promise<Project | null> {
  const r = await db.project.findUnique({ where: { githubRepo } })
  return r ? mapProject(r) : null
}

export async function getProjectById(db: PrismaClient, id: number): Promise<Project | null> {
  const r = await db.project.findUnique({ where: { id } })
  return r ? mapProject(r) : null
}

export async function getProjectByWebhookSecret(db: PrismaClient, webhookSecret: string): Promise<Project | null> {
  const r = await db.project.findFirst({ where: { webhookSecret } })
  return r ? mapProject(r) : null
}

export async function getProjectsByOwner(db: PrismaClient, ownerId: number): Promise<Project[]> {
  const res = await db.project.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } })
  return res.map(mapProject)
}

export async function createProject(db: PrismaClient, data: {
  ownerId: number; githubRepo: string; webhookSecret: string; walletAddress: string
  tipMinUsdt?: string; tipMaxUsdt?: string; dailyCap?: string; cooldownHours?: string
}): Promise<number> {
  const now = BigInt(Date.now())
  const project = await db.project.create({
    data: {
      ownerId: data.ownerId,
      githubRepo: data.githubRepo,
      webhookSecret: data.webhookSecret,
      walletAddress: data.walletAddress,
      tipMinUsdt: data.tipMinUsdt ?? '0.5',
      tipMaxUsdt: data.tipMaxUsdt ?? '50',
      dailyCap: data.dailyCap ?? '100',
      cooldownHours: data.cooldownHours ?? '1',
      createdAt: now,
      updatedAt: now
    }
  })
  // Create treasury for project
  await db.projectTreasury.create({
    data: { projectId: project.id, updatedAt: now }
  })
  return project.id
}

export async function updateProjectRules(db: PrismaClient, projectId: number, rules: {
  tipMinUsdt?: string; tipMaxUsdt?: string; dailyCap?: string; cooldownHours?: string; isActive?: boolean; tasks?: string
}) {
  await db.project.update({
    where: { id: projectId },
    data: {
      ...rules,
      updatedAt: BigInt(Date.now())
    }
  })
}

function mapProject(r: any): Project {
  return {
    id: r.id, ownerId: r.ownerId, githubRepo: r.githubRepo, webhookSecret: r.webhookSecret,
    walletAddress: r.walletAddress, isActive: r.isActive, tipMinUsdt: r.tipMinUsdt,
    tipMaxUsdt: r.tipMaxUsdt, dailyCap: r.dailyCap, cooldownHours: r.cooldownHours,
    tasks: r.tasks || null,
    createdAt: Number(r.createdAt), updatedAt: Number(r.updatedAt)
  }
}

// ══════════════════════════════════════════════════════════════════
// TREASURY QUERIES
// ══════════════════════════════════════════════════════════════════

export async function getProjectTreasury(db: PrismaClient, projectId: number): Promise<ProjectTreasury | null> {
  const r = await db.projectTreasury.findUnique({ where: { projectId } })
  return r ? {
    id: r.id, projectId: r.projectId, balanceUsdt: r.balanceUsdt,
    aaveUsdt: r.aaveUsdt, totalDeposited: r.totalDeposited,
    totalTipped: r.totalTipped, updatedAt: Number(r.updatedAt)
  } : null
}

export async function updateTreasuryBalance(db: PrismaClient, projectId: number, balanceUsdt: string, aaveUsdt?: string) {
  await db.projectTreasury.update({
    where: { projectId },
    data: {
      balanceUsdt,
      ...(aaveUsdt !== undefined && { aaveUsdt }),
      updatedAt: BigInt(Date.now())
    }
  })
}

export async function recordDeposit(db: PrismaClient, projectId: number, amountUsdt: string, txHash: string, fromAddr: string) {
  await db.deposit.create({
    data: {
      projectId, amountUsdt, txHash, fromAddr, status: 'pending', createdAt: BigInt(Date.now())
    }
  })
}

export async function confirmDeposit(db: PrismaClient, txHash: string) {
  const now = BigInt(Date.now())
  const dep = await db.deposit.findFirst({ where: { txHash } })
  if (!dep) return
  
  await db.deposit.update({
    where: { id: dep.id },
    data: { status: 'confirmed', confirmedAt: now }
  })
  
  const treasury = await getProjectTreasury(db, dep.projectId)
  if (treasury) {
    const newBalance = (parseFloat(treasury.balanceUsdt) + parseFloat(dep.amountUsdt)).toString()
    const newTotal = (parseFloat(treasury.totalDeposited) + parseFloat(dep.amountUsdt)).toString()
    await db.projectTreasury.update({
      where: { projectId: dep.projectId },
      data: { balanceUsdt: newBalance, totalDeposited: newTotal, updatedAt: now }
    })
  }
}

// ══════════════════════════════════════════════════════════════════
// RATE LIMITS
// ══════════════════════════════════════════════════════════════════

export async function getRateLimit(db: PrismaClient, key: string): Promise<string | null> {
  const r = await db.rateLimit.findFirst({
    where: { key, expiresAt: { gt: BigInt(Date.now()) } }
  })
  return r?.value ?? null
}

export async function setRateLimit(db: PrismaClient, key: string, value: string, ttlMs: number) {
  const exp = BigInt(Date.now() + ttlMs)
  await db.rateLimit.upsert({
    where: { key },
    update: { value, expiresAt: exp },
    create: { key, value, expiresAt: exp }
  })
}

export async function cleanExpiredRateLimits(db: PrismaClient) {
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: BigInt(Date.now()) } } })
}

// ══════════════════════════════════════════════════════════════════
// TIP HISTORY (Multi-tenant)
// ══════════════════════════════════════════════════════════════════

export async function saveTipHistory(db: PrismaClient, a: {
  projectId: number; eventId: string; event: TipEvent; recipientAddr: string
  amountUsdt: number; reasoning: string; status?: string
}) {
  const now = BigInt(Date.now())
  await db.tipHistory.create({
    data: {
      projectId: a.projectId,
      eventId: a.eventId,
      source: a.event.source,
      eventType: a.event.eventType,
      recipientId: a.event.recipient.id,
      recipientAddr: a.recipientAddr,
      amountUsdt: a.amountUsdt.toString(),
      reasoning: a.reasoning,
      chain: 'base',
      status: a.status ?? 'pending',
      createdAt: now
    }
  })
  
  const treasury = await getProjectTreasury(db, a.projectId)
  if (treasury) {
    const newTipped = (parseFloat(treasury.totalTipped) + a.amountUsdt).toString()
    const newBalance = (parseFloat(treasury.balanceUsdt) - a.amountUsdt).toString()
    await db.projectTreasury.update({
      where: { projectId: a.projectId },
      data: { totalTipped: newTipped, balanceUsdt: newBalance, updatedAt: now }
    })
  }
}

export async function updateTipStatus(db: PrismaClient, eventId: string, status: 'confirmed' | 'failed', txHash?: string, err?: string) {
  await db.tipHistory.update({
    where: { eventId },
    data: { status, txHash: txHash ?? null, errorMsg: err ?? null, confirmedAt: BigInt(Date.now()) }
  })
}

export async function saveAuditLog(db: PrismaClient, a: { projectId?: number; eventId: string; event: TipEvent; result: string; reason?: string }) {
  await db.eventAudit.create({
    data: {
      projectId: a.projectId ?? null,
      eventId: a.eventId,
      source: a.event.source,
      eventType: a.event.eventType,
      result: a.result,
      rejectReason: a.reason ?? null,
      rawPayload: JSON.stringify(a.event.rawPayload),
      createdAt: BigInt(Date.now())
    }
  })
}

export async function getRecentTips(db: PrismaClient, projectId?: number, limit = 20) {
  const tips = await db.tipHistory.findMany({
    where: projectId ? { projectId } : {},
    orderBy: { createdAt: 'desc' },
    take: limit
  })
  return { results: tips }
}

export async function getTipStats(db: PrismaClient, projectId?: number) {
  const where = projectId ? { projectId, status: 'confirmed' } : { status: 'confirmed' }
  
  const tips = await db.tipHistory.findMany({ where, select: { amountUsdt: true } })
  const totalUsdt = tips.reduce((sum: number, t: { amountUsdt: string }) => sum + parseFloat(t.amountUsdt), 0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = BigInt(today.getTime())
  
  const todayCount = await db.tipHistory.count({
    where: { ...where, createdAt: { gte: todayStart } }
  })
  
  const activeUsers = await db.tipHistory.groupBy({
    by: ['recipientId'],
    where
  })
  
  return {
    totalTips: tips.length,
    totalUsdt,
    todayTips: todayCount,
    activeUsers: activeUsers.length
  }
}

export async function saveTreasurySnapshot(db: PrismaClient, a: { projectId: number; liquidUsdt: number; aaveUsdt: number; aaveApy?: string }) {
  await db.treasurySnapshot.create({
    data: {
      projectId: a.projectId,
      liquidUsdt: a.liquidUsdt.toString(),
      aaveUsdt: a.aaveUsdt.toString(),
      totalUsdt: (a.liquidUsdt + a.aaveUsdt).toString(),
      aaveApy: a.aaveApy ?? null,
      snapshotAt: BigInt(Date.now())
    }
  })
}

// ══════════════════════════════════════════════════════════════════
// SESSION QUERIES
// ══════════════════════════════════════════════════════════════════

export async function createSession(db: PrismaClient, userId: number, expiresInMs = 7 * 24 * 60 * 60 * 1000): Promise<string> {
  const id = crypto.randomUUID()
  const now = BigInt(Date.now())
  await db.session.create({
    data: { id, userId, expiresAt: now + BigInt(expiresInMs), createdAt: now }
  })
  return id
}

export async function getSession(db: PrismaClient, sessionId: string): Promise<{ userId: number } | null> {
  const r = await db.session.findFirst({
    where: { id: sessionId, expiresAt: { gt: BigInt(Date.now()) } }
  })
  return r ? { userId: r.userId } : null
}

export async function deleteSession(db: PrismaClient, sessionId: string) {
  await db.session.delete({ where: { id: sessionId } }).catch(() => {})
}

export async function cleanExpiredSessions(db: PrismaClient) {
  await db.session.deleteMany({ where: { expiresAt: { lt: BigInt(Date.now()) } } })
}

// ══════════════════════════════════════════════════════════════════
// CONTRIBUTOR QUERIES (for tip receivers)
// ══════════════════════════════════════════════════════════════════

export async function getAllActiveProjects(db: PrismaClient): Promise<(Project & { ownerUsername: string })[]> {
  const projects = await db.project.findMany({
    where: { isActive: true },
    include: { owner: { select: { githubUsername: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return projects.map(p => ({
    ...mapProject(p),
    ownerUsername: p.owner.githubUsername
  }))
}

export async function getTipsReceivedByUser(db: PrismaClient, githubUsername: string, limit = 50) {
  const tips = await db.tipHistory.findMany({
    where: { recipientId: githubUsername },
    include: { project: { select: { githubRepo: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
  return { results: tips.map((t: any) => ({ ...t, github_repo: t.project.githubRepo })) }
}

export async function getReceivedTipStats(db: PrismaClient, githubUsername: string) {
  const [confirmedTips, pendingTips, projects] = await Promise.all([
    db.tipHistory.findMany({
      where: { recipientId: githubUsername, status: 'confirmed' },
      select: { amountUsdt: true }
    }),
    db.tipHistory.findMany({
      where: { recipientId: githubUsername, status: 'pending' },
      select: { amountUsdt: true }
    }),
    db.tipHistory.groupBy({
      by: ['projectId'],
      where: { recipientId: githubUsername, status: 'confirmed' }
    })
  ])
  
  return {
    totalTips: confirmedTips.length,
    totalUsdt: confirmedTips.reduce((sum: number, t: { amountUsdt: string }) => sum + parseFloat(t.amountUsdt), 0),
    pendingTips: pendingTips.length,
    pendingUsdt: pendingTips.reduce((sum: number, t: { amountUsdt: string }) => sum + parseFloat(t.amountUsdt), 0),
    projectsContributed: projects.length
  }
}
