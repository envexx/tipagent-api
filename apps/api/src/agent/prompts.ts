import type { TipEvent } from '@tipagent/shared'

export function buildSystemPrompt(
  minAmount: number,
  maxAmount: number,
  suggestedMin: number,
  suggestedMax: number,
  ownerTasks?: string | null
): string {
  const taskSection = ownerTasks
    ? `## OWNER'S TASK LIST\n${ownerTasks}\n\n` +
      `## YOUR EVALUATION PROCESS\n` +
      `1. Read the contribution carefully (title, lines changed, labels)\n` +
      `2. Compare it against the task list above\n` +
      `3. Classify the match:\n` +
      `   - FULL MATCH: Contribution directly completes a listed task → tip closer to max ($${suggestedMax})\n` +
      `   - PARTIAL MATCH: Contribution relates to a task but incomplete or minor → tip in middle range\n` +
      `   - LOW IMPACT: Typo fix, small style change, docs only, or NOT in task list → tip at min ($${minAmount})\n` +
      `   - NO VALUE: Empty commit, spam, self-promotion → allowed: false\n`
    : `## YOUR EVALUATION PROCESS\n` +
      `1. Evaluate the contribution quality and complexity\n` +
      `2. Small/trivial changes (typo, style) → tip at min ($${minAmount})\n` +
      `3. Meaningful feature/fix → tip in middle range\n` +
      `4. Large, complex, high-value contribution → tip closer to max ($${suggestedMax})\n`

  return (
    `You are TipAgent, an autonomous USDT tipping bot for open source projects.\n\n` +
    taskSection +
    `## TIP RULES\n` +
    `- Amount MUST be between $${minAmount} and $${maxAmount} USDT\n` +
    `- Do NOT always give max — match the tip to the actual impact\n` +
    `- Suggested range for this contribution: $${suggestedMin}–$${suggestedMax}\n` +
    `- Self-tips (contributor = merger): always set allowed: false\n` +
    `- Return ONLY valid JSON, no explanation outside JSON\n`
  )
}

export function buildUserPrompt(e: TipEvent): string {
  if (e.eventType === 'pr_merged') {
    const size = getSizeLabel(e.context.prAdditions ?? 0, e.context.prDeletions ?? 0)
    return (
      `## CONTRIBUTION TO EVALUATE\n` +
      `Type: Pull Request (merged)\n` +
      `Repo: ${e.context.repoName}\n` +
      `Title: "${e.context.prTitle}"\n` +
      `Size: ${size} (${e.context.prAdditions ?? 0} lines added, ${e.context.prDeletions ?? 0} removed)\n` +
      `Contributor: @${e.recipient.displayName}\n\n` +
      `Does this PR match any task in the task list? How impactful is it? How much USDT should be tipped?`
    )
  }

  if (e.eventType === 'issue_closed') {
    const labels = e.context.issueLabels?.join(', ') ?? 'none'
    return (
      `## CONTRIBUTION TO EVALUATE\n` +
      `Type: Issue (closed)\n` +
      `Repo: ${e.context.repoName}\n` +
      `Labels: ${labels}\n` +
      `Reporter/Closer: @${e.recipient.id}\n\n` +
      `Does this issue match any task in the task list? How impactful is it? How much USDT should be tipped?`
    )
  }

  if (e.eventType === 'discord_reaction') {
    return (
      `## CONTRIBUTION TO EVALUATE\n` +
      `Type: Discord message with ${e.context.reactionCount} reactions\n` +
      `Author: @${e.recipient.id}\n\n` +
      `Evaluate community value based on reaction count. How much USDT should be tipped?`
    )
  }

  return `## CONTRIBUTION TO EVALUATE\nEvaluate this event: ${JSON.stringify(e.context)}`
}

function getSizeLabel(additions: number, deletions: number): string {
  const total = additions + deletions
  if (total < 20) return 'XS (trivial)'
  if (total < 100) return 'S (small)'
  if (total < 300) return 'M (medium)'
  if (total < 800) return 'L (large)'
  return 'XL (very large)'
}
