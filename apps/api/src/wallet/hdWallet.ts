/**
 * HD Wallet Manager for Multi-Tenant TipAgent
 * 
 * Each tenant (project) gets a unique wallet derived from master seed:
 * Uses WDK SDK for HD derivation
 * 
 * This allows:
 * - Each project has isolated funds
 * - Tenants deposit to their own address
 * - Tips come from tenant's wallet, not platform
 * - Yield goes back to tenant's wallet
 * 
 * Uses official Tether WDK SDK
 */

import WDK from '@tetherto/wdk'
import WalletManagerEvm from '@tetherto/wdk-wallet-evm'
import type { Env } from '../index.js'

// USDT contract address on Base
const USDT_BASE = '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'

export class HDWalletManager {
  private wdk: any
  
  constructor(masterSeed: string, rpcUrl: string) {
    this.wdk = new WDK(masterSeed)
      .registerWallet('base', WalletManagerEvm, {
        provider: rpcUrl,
      })
  }
  
  // Factory method to create from Env
  static fromEnv(env: Env): HDWalletManager {
    return new HDWalletManager(env.WDK_MASTER_SEED, env.BASE_RPC_URL)
  }

  /**
   * Get the wallet address for a project
   */
  async getProjectAddress(projectId: number): Promise<string> {
    const account = await this.wdk.getAccount('base', projectId)
    return account.getAddress()
  }

  /**
   * Get USDT balance for a project's wallet
   */
  async getProjectUSDTBalance(projectId: number): Promise<number> {
    const account = await this.wdk.getAccount('base', projectId)
    const usdtBalance = await account.getTokenBalance(USDT_BASE)
    return parseFloat(usdtBalance.toString()) / 1e6
  }

  /**
   * Get ETH balance for a project's wallet (for gas)
   */
  async getProjectETHBalance(projectId: number): Promise<number> {
    const account = await this.wdk.getAccount('base', projectId)
    const balance = await account.getBalance()
    return parseFloat(balance.toString()) / 1e18
  }

  /**
   * Transfer USDT from project wallet to recipient
   * Returns tx hash
   */
  async transferUSDT(projectId: number, to: string, amount: number): Promise<string> {
    const account = await this.wdk.getAccount('base', projectId)
    const result = await account.sendTransaction({
      to,
      value: BigInt(Math.round(amount * 1e6)),
      tokenAddress: USDT_BASE,
    })
    return result.hash
  }

  /**
   * Get chain info
   */
  getChainInfo() {
    return {
      name: 'Base',
      usdtAddress: USDT_BASE,
      blockExplorer: 'https://basescan.org'
    }
  }
}

/**
 * Calculate fee to deduct from tip for gas
 * Fee is in USDT, calculated from estimated ETH gas cost
 */
export async function calculateTipFee(
  hdWallet: HDWalletManager,
  projectId: number,
  recipientAddress: string,
  tipAmount: number,
  ethPriceUSD: number = 3000 // Default ETH price, should be fetched from oracle
): Promise<{ fee: number; netTip: number; gasCostETH: number }> {
  // Estimate gas cost (simplified - WDK handles this internally)
  // Base network has very low gas costs, typically ~$0.001-0.01
  const gasCostETH = 0.00001 // ~21000 gas * 0.5 gwei on Base
  
  // Convert gas cost to USDT (add 20% buffer for gas price fluctuation)
  const fee = gasCostETH * ethPriceUSD * 1.2
  
  // Minimum fee of $0.01
  const finalFee = Math.max(fee, 0.01)
  
  // Net tip after fee deduction
  const netTip = Math.max(tipAmount - finalFee, 0)
  
  return { fee: finalFee, netTip, gasCostETH }
}
