import { Hono } from 'hono'
import { setCookie, getCookie, deleteCookie } from 'hono/cookie'
import type { Env } from '../index'
import { getUserByGithubId, createUser, createSession, getSession, deleteSession, getUserById, updateUserGithubToken } from '../db/queries'

export const authRoute = new Hono<{ Bindings: Env }>()

// GitHub OAuth: Step 1 - Redirect to GitHub
authRoute.get('/github', (c) => {
  const clientId = c.env.GITHUB_CLIENT_ID
  const redirectUri = `${c.env.API_URL}/auth/github/callback`
  // Include 'repo' and 'admin:repo_hook' scopes for webhook creation
  const scope = 'read:user user:email repo admin:repo_hook'
  const state = crypto.randomUUID()
  
  // Store state in cookie for CSRF protection
  setCookie(c, 'oauth_state', state, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 600 })
  
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`
  return c.redirect(url)
})

// GitHub OAuth: Step 2 - Callback
authRoute.get('/github/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const storedState = getCookie(c, 'oauth_state')
  
  if (!code || !state || state !== storedState) {
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=invalid_state`)
  }
  
  deleteCookie(c, 'oauth_state')
  
  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${c.env.API_URL}/auth/github/callback`
      })
    })
    const tokenData = await tokenRes.json() as { access_token?: string; error?: string }
    
    if (!tokenData.access_token) {
      return c.redirect(`${c.env.FRONTEND_URL}/login?error=token_failed`)
    }
    
    // Get user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}`, 'User-Agent': 'TipAgent' }
    })
    const ghUser = await userRes.json() as { id: number; login: string; name?: string; avatar_url?: string }
    
    // Find or create user
    let user = await getUserByGithubId(c.env.DB, ghUser.id.toString())
    if (!user) {
      const userId = await createUser(c.env.DB, {
        githubId: ghUser.id.toString(),
        githubUsername: ghUser.login,
        githubToken: tokenData.access_token,
        displayName: ghUser.name,
        avatarUrl: ghUser.avatar_url
      })
      user = await getUserById(c.env.DB, userId)
    } else {
      // Update token on each login
      await updateUserGithubToken(c.env.DB, user.id, tokenData.access_token)
    }
    
    if (!user) {
      return c.redirect(`${c.env.FRONTEND_URL}/login?error=user_creation_failed`)
    }
    
    // Create session
    const sessionId = await createSession(c.env.DB, user.id)
    
    // For cross-domain (workers.dev -> pages.dev), pass token via URL
    // Frontend will store it in localStorage and use Authorization header
    return c.redirect(`${c.env.FRONTEND_URL}/auth/callback?token=${sessionId}`)
  } catch (e) {
    console.error('[Auth] GitHub OAuth error:', e)
    return c.redirect(`${c.env.FRONTEND_URL}/login?error=oauth_failed`)
  }
})

// Get current user
authRoute.get('/me', async (c) => {
  // Try cookie first, then Authorization header
  let sessionId = getCookie(c, 'session')
  if (!sessionId) {
    const authHeader = c.req.header('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      sessionId = authHeader.slice(7)
    }
  }
  if (!sessionId) {
    return c.json({ user: null })
  }
  
  const session = await getSession(c.env.DB, sessionId)
  if (!session) {
    deleteCookie(c, 'session')
    return c.json({ user: null })
  }
  
  const user = await getUserById(c.env.DB, session.userId)
  if (!user) {
    return c.json({ user: null })
  }
  
  return c.json({
    user: {
      id: user.id,
      githubUsername: user.githubUsername,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      walletAddr: user.walletAddr,
      chain: user.chain
    }
  })
})

// Logout
authRoute.post('/logout', async (c) => {
  const sessionId = getCookie(c, 'session')
  if (sessionId) {
    await deleteSession(c.env.DB, sessionId)
    deleteCookie(c, 'session')
  }
  return c.json({ ok: true })
})
