import { Hono } from 'hono'
import type { Env } from '../../index.js'
import { verifyHmac } from '../../triggers/verifier.js'
import { normalizeDiscordReaction } from '../../triggers/normalizer.js'

export const discordRoute = new Hono<{ Bindings: Env }>()

// Discord webhook - project_id must be in payload
discordRoute.post("/", async (c) => {
  const sig = c.req.header("X-Signature-256") ?? ""
  const body = await c.req.text()
  if (!await verifyHmac(body, sig, c.env.DISCORD_WEBHOOK_SECRET))
    return c.json({ error: "Invalid signature" }, 401)
  const payload = JSON.parse(body)
  
  // Discord payload must include project_id
  const projectId = payload.project_id
  if (!projectId) {
    return c.json({ error: "Missing project_id in payload" }, 400)
  }
  
  const tipEvent = normalizeDiscordReaction(payload, projectId)
  if (!tipEvent) return c.json({ ok: true, skipped: true })
  await c.env.TIP_QUEUE.send({ type: "tip_event", event: tipEvent })
  return c.json({ ok: true, eventId: tipEvent.id })
})
