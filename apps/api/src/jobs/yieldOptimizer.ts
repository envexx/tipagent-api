import type { Env } from '../index'
import { HDWalletManager } from '../wallet/hdWallet'
import { YieldManager } from '../wallet/yieldManager'
import { cleanExpiredRateLimits, getAllActiveProjects } from '../db/queries'

export async function runYieldOptimizer(env: Env) {
  console.log("[Cron] YieldOptimizer running")
  try {
    const hdWallet = HDWalletManager.fromEnv(env)
    const ym = new YieldManager(env)
    const reserve = parseFloat(env.LIQUID_RESERVE_USDT)
    
    // Get all active projects and optimize yield for each
    const projects = await getAllActiveProjects(env.DB)
    for (const project of projects) {
      try {
        const liquid = await hdWallet.getProjectUSDTBalance(project.id)
        console.log(`[Cron] Project#${project.id} Liquid:${liquid} Reserve:${reserve}`)
        if (liquid > reserve) await ym.depositIdleFunds(liquid, project.id)
        await ym.snapshot(project.id, Math.min(liquid, reserve))
      } catch (e) {
        console.error(`[Cron] Error optimizing project ${project.id}:`, e)
      }
    }
    
    await cleanExpiredRateLimits(env.DB)
  } catch (e) { console.error("[Cron] Error:", e) }
}
