import { Hono } from 'hono'
import type { Env } from '../index.js'
import { HDWalletManager } from '../wallet/hdWallet.js'
import { YieldManager } from '../wallet/yieldManager.js'

export const healthRoute = new Hono<{ Bindings: Env }>()

// Basic health check (no wallet required)
healthRoute.get("/", async (c) => {
  return c.json({
    ok: true,
    env: c.env.ENVIRONMENT,
    timestamp: new Date().toISOString(),
  })
})

// Detailed health check with wallet info (requires valid seed)
healthRoute.get("/detailed", async (c) => {
  try {
    const hdWallet = HDWalletManager.fromEnv(c.env)
    const ym = new YieldManager(c.env)
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
