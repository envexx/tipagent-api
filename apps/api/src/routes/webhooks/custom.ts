import { Hono } from 'hono'
import type { Env } from '../../index.js'
import { verifyHmac } from '../../triggers/verifier.js'
import { normalizeCustomWebhook } from '../../triggers/normalizer.js'
import { getProjectByWebhookSecret } from '../../db/queries.js'

export const customRoute = new Hono<{ Bindings: Env }>()

// Custom webhook endpoint - requires project_id in payload or header
customRoute.post("/", async (c) => {
  const sig = c.req.header("X-Signature-256") ?? ""
  const webhookSecret = c.req.header("X-Webhook-Secret") ?? ""
  const body = await c.req.text()
  
  // Find project by webhook secret
  const project = await getProjectByWebhookSecret(c.env.DB, webhookSecret)
  if (!project) {
    return c.json({ error: "Invalid webhook secret" }, 401)
  }
  
  if (!await verifyHmac(body, sig, webhookSecret)) {
    return c.json({ error: "Invalid signature" }, 401)
  }
  
  const payload = JSON.parse(body)
  const tipEvent = normalizeCustomWebhook(payload, project.id)
  await c.env.TIP_QUEUE.send({ type: "tip_event", event: tipEvent })
  return c.json({ ok: true, eventId: tipEvent.id })
})
