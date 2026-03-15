/**
 * GitHub API helpers for webhook management
 */

interface WebhookConfig {
  url: string
  secret: string
  events: string[]
}

interface WebhookResponse {
  id: number
  url: string
  active: boolean
  events: string[]
  config: {
    url: string
    content_type: string
  }
}

/**
 * Create a webhook on a GitHub repository
 */
export async function createGitHubWebhook(
  token: string,
  repo: string,
  config: WebhookConfig
): Promise<{ ok: true; webhookId: number } | { ok: false; error: string }> {
  const [owner, repoName] = repo.split('/')
  
  if (!owner || !repoName) {
    return { ok: false, error: 'Invalid repo format' }
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'TipAgent'
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: config.events,
        config: {
          url: config.url,
          content_type: 'json',
          secret: config.secret,
          insecure_ssl: '0'
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[GitHub] Webhook creation failed:', response.status, JSON.stringify(errorData))
      
      if (response.status === 404) {
        return { ok: false, error: 'Repository not found or no admin access' }
      }
      if (response.status === 403) {
        const msg = (errorData as any)?.message || 'No permission'
        console.error('[GitHub] 403 error details:', msg)
        return { ok: false, error: `No permission to create webhooks: ${msg}. Please logout and login again to grant admin:repo_hook permission.` }
      }
      if (response.status === 422) {
        // Webhook might already exist
        const msg = (errorData as any)?.errors?.[0]?.message || 'Webhook already exists'
        if (msg.includes('already exists')) {
          return { ok: false, error: 'Webhook already exists for this repository' }
        }
        return { ok: false, error: msg }
      }
      
      return { ok: false, error: `GitHub API error: ${response.status} - ${JSON.stringify(errorData)}` }
    }

    const webhook = await response.json() as WebhookResponse
    return { ok: true, webhookId: webhook.id }
    
  } catch (e: any) {
    console.error('[GitHub] Failed to create webhook:', e)
    return { ok: false, error: e.message || 'Failed to connect to GitHub' }
  }
}

/**
 * Delete a webhook from a GitHub repository
 */
export async function deleteGitHubWebhook(
  token: string,
  repo: string,
  webhookId: number
): Promise<{ ok: boolean; error?: string }> {
  const [owner, repoName] = repo.split('/')

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/hooks/${webhookId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }
    })

    if (!response.ok && response.status !== 404) {
      return { ok: false, error: `Failed to delete webhook: ${response.status}` }
    }

    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e.message }
  }
}

/**
 * Check if user has admin access to a repository
 */
export async function checkRepoAccess(
  token: string,
  repo: string
): Promise<{ hasAccess: boolean; isAdmin: boolean; error?: string }> {
  const [owner, repoName] = repo.split('/')
  console.log(`[GitHub] Checking access for repo: ${owner}/${repoName}`)

  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'TipAgent'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`[GitHub] checkRepoAccess failed:`, response.status, JSON.stringify(errorData))
      if (response.status === 404) {
        return { hasAccess: false, isAdmin: false, error: 'Repository not found' }
      }
      if (response.status === 403) {
        return { hasAccess: false, isAdmin: false, error: `GitHub API error: ${(errorData as any)?.message || 'Forbidden'}` }
      }
      return { hasAccess: false, isAdmin: false, error: `GitHub API error: ${response.status}` }
    }

    const data = await response.json() as { permissions?: { admin?: boolean; push?: boolean } }
    
    return {
      hasAccess: true,
      isAdmin: data.permissions?.admin === true
    }
  } catch (e: any) {
    return { hasAccess: false, isAdmin: false, error: e.message }
  }
}
