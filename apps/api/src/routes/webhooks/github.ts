import { Hono } from 'hono'
import type { Env } from '../../index.js'
import { verifyGitHubSignature } from '../../triggers/verifier.js'
import { normalizeGitHubPR, normalizeGitHubIssue } from '../../triggers/normalizer.js'
import { getProjectByRepo } from '../../db/queries.js'

export const githubRoute = new Hono<{ Bindings: Env }>()

githubRoute.post('/', async (c) => {
  const sig = c.req.header('X-Hub-Signature-256') ?? ''
  const body = await c.req.text()
  const payload = JSON.parse(body)
  
  // Get repo name from payload to find the project
  const repoFullName = payload.repository?.full_name
  if (!repoFullName) {
    return c.json({ error: 'Missing repository info' }, 400)
  }
  
  // Find project by repo
  const project = await getProjectByRepo(c.env.DB, repoFullName)
  if (!project) {
    return c.json({ error: 'Project not registered', repo: repoFullName }, 404)
  }
  
  if (!project.isActive) {
    return c.json({ ok: true, skipped: true, reason: 'Project is inactive' })
  }
  
  // Verify signature using project's webhook secret
  if (!await verifyGitHubSignature(body, sig, project.webhookSecret)) {
    return c.json({ error: 'Invalid signature' }, 401)
  }
  
  const event = c.req.header('X-GitHub-Event')
  const tipEvent = event === 'pull_request' ? normalizeGitHubPR(payload, project.id)
    : event === 'issues' ? normalizeGitHubIssue(payload, project.id) : null
  
  if (!tipEvent) {
    return c.json({ ok: true, skipped: true, reason: 'Event type not supported' })
  }
  
  await c.env.TIP_QUEUE.send({ type: 'tip_event', event: tipEvent })
  return c.json({ ok: true, eventId: tipEvent.id, projectId: project.id })
})
