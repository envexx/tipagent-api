import type { TipEvent } from '@tipagent/shared'

export function buildSystemPrompt(
  minAmount: number, 
  maxAmount: number, 
  suggestedMin: number, 
  suggestedMax: number,
  ownerTasks?: string | null
): string {
  let prompt = (
    `You are TipAgent, an autonomous USDT tipping bot. Return ONLY valid JSON. ` +
    `Amount MUST be between ${minAmount} and ${maxAmount} USDT. ` +
    `Suggested range: ${suggestedMin}–${suggestedMax} USDT. ` +
    `Low impact → use min range. High impact → use max. Self-tips: always allowed:false.`
  )
  
  if (ownerTasks) {
    prompt += `\n\nPROJECT OWNER'S TASK PRIORITIES:\n${ownerTasks}\n\n` +
      `Use these priorities to evaluate contributions. ` +
      `Work that matches high-priority tasks should receive higher tips. ` +
      `Work that matches low-priority tasks or is not listed should receive lower tips.`
  }
  
  return prompt
}

export function buildUserPrompt(e: TipEvent): string {
  if (e.eventType === "pr_merged")
    return `GitHub PR merged. Repo: ${e.context.repoName}. Title: "${e.context.prTitle}". Lines added: ${e.context.prAdditions}, removed: ${e.context.prDeletions}. Contributor: ${e.recipient.displayName}.`
  if (e.eventType === "issue_closed")
    return `GitHub Issue closed. Repo: ${e.context.repoName}. Labels: ${e.context.issueLabels?.join(",") ?? "none"}. Reporter: ${e.recipient.id}.`
  if (e.eventType === "discord_reaction")
    return `Discord message got ${e.context.reactionCount} reactions. Author: ${e.recipient.id}.`
  if (e.eventType === "discord_command")
    return `Discord command tip request. Recipient: ${e.recipient.id}. Channel: ${e.context.discordChannelId}.`
  return `Evaluate custom event: ${JSON.stringify(e.context)}`
}
