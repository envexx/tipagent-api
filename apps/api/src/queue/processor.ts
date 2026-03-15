import type { TipEvent } from '@tipagent/shared'
import type { Env } from '../index.js'
import { evaluateRules } from '../engine/ruleEngine.js'
import { evaluateWithGemini } from '../agent/brain.js'
import { HDWalletManager, calculateTipFee } from '../wallet/hdWallet.js'
import { notifyGitHub } from '../notifier/github.js'
import { notifyDiscord } from '../notifier/discord.js'
import { 
  saveAuditLog, saveTipHistory, updateTipStatus, setRateLimit, getRateLimit,
  getProjectById, getUserByUsername
} from '../db/queries.js'

export interface QueueMessage { type: 'tip_event'; event: TipEvent }

export async function processQueueMessage(msg: QueueMessage, env: Env) {
  const { event } = msg
  console.log(`[Queue] ${event.id} (${event.eventType}) project:${event.projectId}`)
  
  const hdWallet = HDWalletManager.fromEnv(env)
  
  // Step 1: Get project and verify it's active
  const project = await getProjectById(env.DB, event.projectId)
  if (!project) {
    console.error(`[Queue] Project ${event.projectId} not found`)
    return
  }
  if (!project.isActive) {
    console.log(`[Queue] Project ${event.projectId} is inactive, skipping`)
    return
  }
  
  // Step 2: Check project wallet has USDT funds (live from blockchain)
  const usdtBalance = await hdWallet.getProjectUSDTBalance(event.projectId)
  if (usdtBalance < 0.5) {
    await saveAuditLog(env.DB, { 
      projectId: event.projectId, eventId: event.id, event, 
      result: 'held', reason: `Insufficient USDT balance: ${usdtBalance.toFixed(2)}` 
    })
    console.log(`[Queue] Project ${event.projectId} has insufficient USDT: ${usdtBalance}`)
    return
  }
  
  // Step 3: Check project wallet has ETH for gas
  const ethBalance = await hdWallet.getProjectETHBalance(event.projectId)
  if (ethBalance < 0.0001) {
    await saveAuditLog(env.DB, { 
      projectId: event.projectId, eventId: event.id, event, 
      result: 'held', reason: `Insufficient ETH for gas: ${ethBalance.toFixed(6)}` 
    })
    console.log(`[Queue] Project ${event.projectId} has insufficient ETH for gas`)
    return
  }
  
  // Step 4: Audit log - processing
  await saveAuditLog(env.DB, { projectId: event.projectId, eventId: event.id, event, result: 'processing' })
  
  // Step 5: Resolve recipient wallet (user must be registered on platform)
  const recipient = await getUserByUsername(env.DB, event.recipient.id)
  if (!recipient || !recipient.walletAddr) {
    await saveAuditLog(env.DB, { 
      projectId: event.projectId, eventId: event.id, event, 
      result: 'held', reason: `User ${event.recipient.id} not registered or no wallet` 
    })
    console.log(`[Queue] Recipient ${event.recipient.id} not registered`)
    return
  }
  event.recipient.walletAddress = recipient.walletAddr
  
  // Step 6: Rule engine (using project-specific rules)
  const rule = await evaluateRules(event, project, env)
  if (!rule.allowed) {
    await saveAuditLog(env.DB, { 
      projectId: event.projectId, eventId: event.id, event, 
      result: 'rejected', reason: rule.rejectReason 
    })
    return
  }
  
  // Step 7: AI evaluation (include owner's task priorities)
  const dec = await evaluateWithGemini(event, rule, env.GEMINI_API_KEY, project.tasks)
  if (!dec.allowed) {
    await saveAuditLog(env.DB, { 
      projectId: event.projectId, eventId: event.id, event, 
      result: 'rejected', reason: dec.rejectReason 
    })
    return
  }
  
  // Step 8: Calculate fee (gas cost deducted from tip)
  const { fee, netTip, gasCostETH } = await calculateTipFee(
    hdWallet, event.projectId, recipient.walletAddr as `0x${string}`, dec.amountUsdt
  )
  
  // Verify project has enough for tip
  if (usdtBalance < dec.amountUsdt) {
    await saveAuditLog(env.DB, { 
      projectId: event.projectId, eventId: event.id, event, 
      result: 'held', reason: `Insufficient funds: need ${dec.amountUsdt}, have ${usdtBalance.toFixed(2)}` 
    })
    return
  }
  
  // Step 9: Save pending tip
  await saveTipHistory(env.DB, {
    projectId: event.projectId,
    eventId: event.id,
    event,
    recipientAddr: recipient.walletAddr,
    amountUsdt: netTip, // Net amount after fee
    reasoning: `${dec.reasoning} (Fee: $${fee.toFixed(4)}, Gas: ${gasCostETH.toFixed(6)} ETH)`,
    status: 'processing'
  })
  
  // Step 10: Execute transfer from PROJECT'S HD wallet (not platform wallet)
  try {
    const tx = await hdWallet.transferUSDT(event.projectId, recipient.walletAddr as `0x${string}`, netTip)
    console.log(`[HD Wallet] Project ${event.projectId}: $${netTip} USDT → ${recipient.walletAddr} tx:${tx}`)
    
    // Update rate limits (per project + user)
    const cdKey = `cooldown:${event.projectId}:${event.recipient.id}`
    const today = new Date().toISOString().split('T')[0]
    const capKey = `dailycap:${event.projectId}:${event.recipient.id}:${today}`
    const prev = parseFloat((await getRateLimit(env.DB, capKey)) ?? '0')
    
    await Promise.all([
      setRateLimit(env.DB, cdKey, Date.now().toString(), 86_400_000),
      setRateLimit(env.DB, capKey, (prev + netTip).toString(), 86_400_000),
      updateTipStatus(env.DB, event.id, 'confirmed', tx),
    ])
    
    // Step 11: Notify
    if (event.source === 'github') {
      await notifyGitHub(event, netTip, tx, env.GITHUB_TOKEN)
    } else if (event.source === 'discord') {
      await notifyDiscord(event, netTip, tx, env.DISCORD_BOT_TOKEN)
    }
  } catch (e) {
    console.error(`[Queue] Transfer failed:`, e)
    await updateTipStatus(env.DB, event.id, 'failed', undefined, String(e))
    throw e
  }
}
