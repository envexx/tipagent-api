import type { TipEvent } from '@tipagent/shared'

export function normalizeGitHubPR(p: any, projectId: number): TipEvent | null {
  if (p.action !== 'closed' || !p.pull_request?.merged) return null
  const pr = p.pull_request
  return {
    id: crypto.randomUUID(),
    projectId,
    source: 'github',
    eventType: 'pr_merged',
    actor: { id: pr.merged_by?.login ?? pr.user.login },
    recipient: { id: pr.user.login, displayName: pr.user.login },
    context: {
      repoName: p.repository.full_name,
      prNumber: pr.number,
      prTitle: pr.title,
      prAdditions: pr.additions,
      prDeletions: pr.deletions
    },
    timestamp: Date.now(),
    rawPayload: p
  }
}

export function normalizeGitHubIssue(p: any, projectId: number): TipEvent | null {
  if (p.action !== 'closed' || !p.issue) return null
  const i = p.issue
  return {
    id: crypto.randomUUID(),
    projectId,
    source: 'github',
    eventType: 'issue_closed',
    actor: { id: p.sender.login },
    recipient: { id: i.user.login, displayName: i.user.login },
    context: {
      repoName: p.repository.full_name,
      issueNumber: i.number,
      issueLabels: i.labels?.map((l: any) => l.name) ?? []
    },
    timestamp: Date.now(),
    rawPayload: p
  }
}

export function normalizeDiscordReaction(p: any, projectId: number): TipEvent | null {
  return {
    id: crypto.randomUUID(),
    projectId,
    source: 'discord',
    eventType: 'discord_reaction',
    actor: { id: 'system' },
    recipient: { id: p.message_author_id },
    context: {
      discordChannelId: p.channel_id,
      discordMessageId: p.message_id,
      reactionCount: p.reaction_count
    },
    timestamp: Date.now(),
    rawPayload: p
  }
}

export function normalizeCustomWebhook(p: any, projectId: number): TipEvent {
  return {
    id: crypto.randomUUID(),
    projectId,
    source: 'webhook',
    eventType: 'custom_webhook',
    actor: { id: p.actor_id ?? 'system', displayName: p.actor_name },
    recipient: { id: p.recipient_id, displayName: p.recipient_name },
    context: { customPayload: p },
    timestamp: Date.now(),
    rawPayload: p
  }
}
