import { Hono } from 'hono'
import type { Env } from '../index'
import { HDWalletManager } from '../wallet/hdWallet'
import { YieldManager } from '../wallet/yieldManager'

export const healthRoute = new Hono<{ Bindings: Env }>()

healthRoute.get("/", async (c) => {
  try {
    const hdWallet = HDWalletManager.fromEnv(c.env)
    const ym = new YieldManager(c.env)
    // Check platform wallet (project 0)
    const walletAddress = await hdWallet.getProjectAddress(0)
    const liquidUsdt = await hdWallet.getProjectUSDTBalance(0)
    const aaveUsdt = await ym.getAaveBalance(0).catch(() => 0)
    return c.json({
      ok: true,
      walletAddress,
      liquidUsdt,
      aaveUsdt,
      totalUsdt: liquidUsdt + aaveUsdt,
      env: c.env.ENVIRONMENT,
    })
  } catch (e) {
    return c.json({ ok: false, error: String(e) }, 500)
  }
})
