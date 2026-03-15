export type TipEventSource = 'github' | 'discord' | 'webhook'
export type TipEventType = 'pr_merged' | 'issue_closed' | 'discord_reaction' | 'discord_command' | 'discord_thread_resolved' | 'custom_webhook'

export interface TipEvent {
  id: string
  projectId: number                              // Multi-tenant: which project this belongs to
  source: TipEventSource
  eventType: TipEventType
  actor:     { id: string; displayName?: string }
  recipient: { id: string; displayName?: string; walletAddress?: string }
  context: {
    repoName?: string; prNumber?: number; prTitle?: string
    prAdditions?: number; prDeletions?: number
    issueNumber?: number; issueLabels?: string[]
    discordChannelId?: string; discordMessageId?: string; reactionCount?: number
    customPayload?: Record<string, unknown>
  }
  timestamp: number
  rawPayload: unknown
}

export interface TipDecision {
  allowed: boolean; amountUsdt: number; reasoning: string; rejectReason?: string
}

// Multi-tenant types
export interface User {
  id: number
  githubId: string
  githubUsername: string
  displayName?: string
  avatarUrl?: string
  walletAddr?: string
  chain: string
  createdAt: number
  updatedAt: number
}

export interface Project {
  id: number
  ownerId: number
  githubRepo: string
  webhookSecret: string
  walletAddress: string              // HD-derived wallet for deposits
  isActive: boolean
  tipMinUsdt: string
  tipMaxUsdt: string
  dailyCap: string
  cooldownHours: string
  tasks?: string | null              // Owner's task descriptions for AI evaluation
  createdAt: number
  updatedAt: number
}

export interface ProjectTreasury {
  id: number
  projectId: number
  balanceUsdt: string
  aaveUsdt: string
  totalDeposited: string
  totalTipped: string
  updatedAt: number
}

export interface Deposit {
  id: number
  projectId: number
  amountUsdt: string
  txHash: string
  fromAddr: string
  status: 'pending' | 'confirmed' | 'failed'
  createdAt: number
  confirmedAt?: number
}
