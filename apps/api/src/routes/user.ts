import { Hono } from 'hono'
import type { Env } from '../index'
import { updateUserWallet, getUserById, getUserGithubToken } from '../db/queries'

export const userRoute = new Hono<{ Bindings: Env }>()

// Get current user profile
userRoute.get('/profile', async (c) => {
  const user = c.get('user')
  return c.json({
    id: user.id,
    githubUsername: user.githubUsername,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    walletAddr: user.walletAddr,
    chain: user.chain
  })
})

// Update wallet address
userRoute.put('/wallet', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json<{ walletAddr: string; chain?: string }>()
  
  if (!body.walletAddr || !/^0x[a-fA-F0-9]{40}$/.test(body.walletAddr)) {
    return c.json({ error: 'Invalid wallet address' }, 400)
  }
  
  await updateUserWallet(c.env.DB, userId, body.walletAddr, body.chain || 'base')
  
  const updated = await getUserById(c.env.DB, userId)
  return c.json({ ok: true, user: updated })
})

// Get user's GitHub repositories
userRoute.get('/github-repos', async (c) => {
  const userId = c.get('userId')
  const token = await getUserGithubToken(c.env.DB, userId)
  
  if (!token) {
    return c.json({ error: 'GitHub token not found. Please re-login.' }, 401)
  }
  
  try {
    // Fetch repos from GitHub API (user's repos + repos they have push access to)
    const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'TipAgent',
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!res.ok) {
      if (res.status === 401) {
        return c.json({ error: 'GitHub token expired. Please re-login.' }, 401)
      }
      return c.json({ error: 'Failed to fetch repos from GitHub' }, 500)
    }
    
    const repos = await res.json() as Array<{
      id: number
      full_name: string
      name: string
      description: string | null
      private: boolean
      html_url: string
      pushed_at: string
      permissions?: { admin: boolean; push: boolean }
    }>
    
    // Filter to repos where user has admin/push access (can add webhooks)
    const eligibleRepos = repos
      .filter(r => r.permissions?.admin || r.permissions?.push)
      .map(r => ({
        id: r.id,
        fullName: r.full_name,
        name: r.name,
        description: r.description,
        isPrivate: r.private,
        url: r.html_url,
        pushedAt: r.pushed_at
      }))
    
    return c.json({ repos: eligibleRepos })
  } catch (e) {
    console.error('[GitHub API] Error fetching repos:', e)
    return c.json({ error: 'Failed to fetch repos' }, 500)
  }
})
