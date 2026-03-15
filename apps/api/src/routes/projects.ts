import { Hono } from 'hono'
import type { Env } from '../index'
import { 
  getProjectsByOwner, getProjectById, createProject, updateProjectRules,
  getProjectTreasury, getUserByUsername, getUserGithubToken
} from '../db/queries'
import { HDWalletManager } from '../wallet/hdWallet'
import { createGitHubWebhook, checkRepoAccess } from '../lib/github'

export const projectsRoute = new Hono<{ Bindings: Env }>()

// List user's projects with live balance from blockchain
projectsRoute.get('/', async (c) => {
  const userId = c.get('userId')
  const projects = await getProjectsByOwner(c.env.DB, userId)
  const hdWallet = HDWalletManager.fromEnv(c.env)
  
  // Get treasury and live balance for each project
  const projectsWithTreasury = await Promise.all(
    projects.map(async (p) => {
      const treasury = await getProjectTreasury(c.env.DB, p.id)
      // Get live balance from blockchain
      let liveBalance = 0
      let ethBalance = 0
      try {
        liveBalance = await hdWallet.getProjectUSDTBalance(p.id)
        ethBalance = await hdWallet.getProjectETHBalance(p.id)
      } catch (e) {
        console.error(`[Projects] Failed to get balance for project ${p.id}:`, e)
      }
      return { 
        ...p, 
        treasury: {
          ...treasury,
          liveBalanceUsdt: liveBalance.toFixed(2),
          ethBalance: ethBalance.toFixed(6)
        }
      }
    })
  )
  
  return c.json({ projects: projectsWithTreasury })
})

// Get single project with live balance
projectsRoute.get('/:id', async (c) => {
  const userId = c.get('userId')
  const projectId = parseInt(c.req.param('id'))
  
  const project = await getProjectById(c.env.DB, projectId)
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  if (project.ownerId !== userId) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  const treasury = await getProjectTreasury(c.env.DB, projectId)
  const hdWallet = HDWalletManager.fromEnv(c.env)
  
  // Get live balance from blockchain
  let liveBalanceUsdt = '0.00'
  let ethBalance = '0.000000'
  try {
    liveBalanceUsdt = (await hdWallet.getProjectUSDTBalance(projectId)).toFixed(2)
    ethBalance = (await hdWallet.getProjectETHBalance(projectId)).toFixed(6)
  } catch (e) {
    console.error(`[Projects] Failed to get live balance for project ${projectId}:`, e)
  }
  
  return c.json({ 
    project, 
    treasury: {
      ...treasury,
      liveBalanceUsdt,
      ethBalance
    }
  })
})

// Create new project
projectsRoute.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ 
    githubRepo: string
    tipMinUsdt?: string
    tipMaxUsdt?: string
    dailyCap?: string
    cooldownHours?: string
  }>()
  
  if (!body.githubRepo || !/^[\w-]+\/[\w.-]+$/.test(body.githubRepo)) {
    return c.json({ error: 'Invalid GitHub repo format (should be owner/repo)' }, 400)
  }
  
  // Get user's GitHub token for webhook creation
  const githubToken = await getUserGithubToken(c.env.DB, userId)
  console.log(`[Projects] Creating project for user ${userId}, repo: ${body.githubRepo}, token exists: ${!!githubToken}`)
  if (!githubToken) {
    return c.json({ error: 'GitHub token not found. Please re-login.' }, 401)
  }
  
  // Check if user has admin access to the repo
  const access = await checkRepoAccess(githubToken, body.githubRepo)
  console.log(`[Projects] Access check result:`, JSON.stringify(access))
  if (!access.hasAccess) {
    return c.json({ error: access.error || 'Repository not found' }, 404)
  }
  if (!access.isAdmin) {
    return c.json({ error: 'You need admin access to this repository to add webhooks' }, 403)
  }
  
  // Generate unique webhook secret for this project
  const webhookSecret = crypto.randomUUID().replace(/-/g, '')
  const webhookUrl = `${c.env.API_URL}/webhooks/github`
  
  // Auto-register webhook on GitHub
  const webhookResult = await createGitHubWebhook(githubToken, body.githubRepo, {
    url: webhookUrl,
    secret: webhookSecret,
    events: ['pull_request', 'issues']
  })
  
  if (!webhookResult.ok) {
    return c.json({ error: `Failed to create webhook: ${webhookResult.error}` }, 400)
  }
  
  // We need to get the next project ID to derive wallet address
  // First insert, then derive wallet based on actual ID
  try {
    // Create project first to get ID
    const projectId = await createProject(c.env.DB, {
      ownerId: userId,
      githubRepo: body.githubRepo,
      webhookSecret,
      walletAddress: '0x0000000000000000000000000000000000000000', // Placeholder
      tipMinUsdt: body.tipMinUsdt,
      tipMaxUsdt: body.tipMaxUsdt,
      dailyCap: body.dailyCap,
      cooldownHours: body.cooldownHours
    })
    
    // Now derive the actual wallet address using project ID
    const hdWallet = HDWalletManager.fromEnv(c.env)
    const walletAddress = await hdWallet.getProjectAddress(projectId)
    
    // Update project with real wallet address and webhook ID
    await c.env.DB.prepare('UPDATE projects SET wallet_address=?, webhook_id=? WHERE id=?')
      .bind(walletAddress, webhookResult.webhookId, projectId).run()
    
    const project = await getProjectById(c.env.DB, projectId)
    const treasury = await getProjectTreasury(c.env.DB, projectId)
    const chainInfo = hdWallet.getChainInfo()
    
    return c.json({ 
      ok: true, 
      project, 
      treasury,
      walletAddress,
      chainInfo,
      webhookSetup: 'auto', // Webhook was auto-configured!
      depositInstructions: [
        `✅ Webhook automatically configured on GitHub!`,
        `Your project wallet address: ${walletAddress}`,
        `Network: ${chainInfo.name}`,
        `1. Send USDT to this address to fund your treasury`,
        `2. Also send a small amount of ETH (0.001-0.01) for gas fees`,
        `3. Balance will be reflected automatically`
      ]
    }, 201)
  } catch (e: any) {
    if (e.message?.includes('UNIQUE constraint')) {
      return c.json({ error: 'This repository is already registered' }, 409)
    }
    throw e
  }
})

// Update project rules and tasks
projectsRoute.put('/:id', async (c) => {
  const userId = c.get('userId')
  const projectId = parseInt(c.req.param('id'))
  
  const project = await getProjectById(c.env.DB, projectId)
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  if (project.ownerId !== userId) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  const body = await c.req.json<{
    tipMinUsdt?: string
    tipMaxUsdt?: string
    dailyCap?: string
    cooldownHours?: string
    isActive?: boolean
    tasks?: string
  }>()
  
  // Validate tip rules
  if (body.tipMinUsdt && (isNaN(parseFloat(body.tipMinUsdt)) || parseFloat(body.tipMinUsdt) < 0)) {
    return c.json({ error: 'Invalid min tip amount' }, 400)
  }
  if (body.tipMaxUsdt && (isNaN(parseFloat(body.tipMaxUsdt)) || parseFloat(body.tipMaxUsdt) < 0)) {
    return c.json({ error: 'Invalid max tip amount' }, 400)
  }
  if (body.tipMinUsdt && body.tipMaxUsdt && parseFloat(body.tipMinUsdt) > parseFloat(body.tipMaxUsdt)) {
    return c.json({ error: 'Min tip cannot be greater than max tip' }, 400)
  }
  
  await updateProjectRules(c.env.DB, projectId, body)
  
  const updated = await getProjectById(c.env.DB, projectId)
  return c.json({ ok: true, project: updated })
})

// Get webhook setup instructions
projectsRoute.get('/:id/webhook-setup', async (c) => {
  const userId = c.get('userId')
  const projectId = parseInt(c.req.param('id'))
  
  const project = await getProjectById(c.env.DB, projectId)
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  if (project.ownerId !== userId) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  return c.json({
    webhookUrl: `${c.env.API_URL}/webhooks/github`,
    webhookSecret: project.webhookSecret,
    contentType: 'application/json',
    events: ['pull_request', 'issues'],
    instructions: [
      `1. Go to https://github.com/${project.githubRepo}/settings/hooks`,
      '2. Click "Add webhook"',
      `3. Payload URL: ${c.env.API_URL}/webhooks/github`,
      '4. Content type: application/json',
      `5. Secret: ${project.webhookSecret}`,
      '6. Select events: Pull requests, Issues',
      '7. Click "Add webhook"'
    ]
  })
})

// Register a contributor's wallet for this project
projectsRoute.post('/:id/contributors', async (c) => {
  const userId = c.get('userId')
  const projectId = parseInt(c.req.param('id'))
  
  const project = await getProjectById(c.env.DB, projectId)
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  if (project.ownerId !== userId) {
    return c.json({ error: 'Not authorized' }, 403)
  }
  
  const body = await c.req.json<{ githubUsername: string; walletAddr: string }>()
  
  if (!body.githubUsername || !body.walletAddr) {
    return c.json({ error: 'githubUsername and walletAddr required' }, 400)
  }
  
  // Note: In multi-tenant, contributors register themselves via the platform
  // This endpoint is for project owners to manually add contributors who haven't signed up
  // We'll store this in the users table with a placeholder github_id
  
  let user = await getUserByUsername(c.env.DB, body.githubUsername)
  if (user) {
    // User exists, just needs to update their wallet
    return c.json({ 
      message: 'User already registered. They can update their wallet in their profile.',
      user: { githubUsername: user.githubUsername, walletAddr: user.walletAddr }
    })
  }
  
  // For now, we don't auto-create users - they need to sign up via GitHub OAuth
  return c.json({ 
    message: 'User not registered yet. They need to sign up at the platform and set their wallet address.',
    signupUrl: `${c.env.FRONTEND_URL}/login`
  })
})
