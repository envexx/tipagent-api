import type { TipEvent, Project } from '@tipagent/shared'
import type { Env } from '../index.js'
import type { RuleResult } from './types.js'
import { getRateLimit } from '../db/queries.js'

export async function evaluateRules(event: TipEvent, project: Project, env: Env): Promise<RuleResult> {
  // Use project-specific rules
  const cfg = {
    min: parseFloat(project.tipMinUsdt),
    max: parseFloat(project.tipMaxUsdt),
    cap: parseFloat(project.dailyCap),
    cd: parseFloat(project.cooldownHours)
  }
  
  // Self-tip check
  if (event.actor.id === event.recipient.id) {
    return reject('Self-tip not allowed')
  }
  
  // Cooldown check (per project + user)
  const cdKey = `cooldown:${event.projectId}:${event.recipient.id}`
  const last = await getRateLimit(env.DB, cdKey)
  if (last) {
    const elapsedHours = (Date.now() - parseInt(last)) / 3_600_000
    if (elapsedHours < cfg.cd) {
      return reject(`Cooldown: ${(cfg.cd - elapsedHours).toFixed(1)}h remaining`)
    }
  }
  
  // Daily cap check (per project + user)
  const today = new Date().toISOString().split('T')[0]
  const capKey = `dailycap:${event.projectId}:${event.recipient.id}:${today}`
  const prev = parseFloat((await getRateLimit(env.DB, capKey)) ?? '0')
  if (prev >= cfg.cap) {
    return reject(`Daily cap reached: ${prev} USDT sent today (max: ${cfg.cap})`)
  }
  
  // Calculate tier-based suggestion
  const [sMin, sMax] = tier(event)
  const effectiveMax = Math.min(cfg.max, sMax, cfg.cap - prev)
  
  return {
    allowed: true,
    minAmount: cfg.min,
    maxAmount: effectiveMax,
    suggestedMin: Math.max(sMin, cfg.min),
    suggestedMax: Math.min(sMax, effectiveMax)
  }
}

function tier(e: TipEvent): [number, number] {
  switch (e.eventType) {
    case 'pr_merged': {
      const additions = e.context.prAdditions ?? 0
      if (additions < 50) return [0.5, 2]
      if (additions < 300) return [2, 10]
      return [10, 50]
    }
    case 'issue_closed':
      return (e.context.issueLabels ?? []).includes('bug') ? [1, 5] : [0.5, 2]
    case 'discord_reaction':
      return [0.5, 1]
    case 'discord_command':
      return [1, 10]
    case 'discord_thread_resolved':
      return [1, 3]
    default:
      return [0.5, 3]
  }
}

function reject(reason: string): RuleResult {
  return {
    allowed: false,
    rejectReason: reason,
    minAmount: 0,
    maxAmount: 0,
    suggestedMin: 0,
    suggestedMax: 0
  }
}
