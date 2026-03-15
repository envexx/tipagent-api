/**
 * Environment configuration for Node.js runtime
 * Loads from .dev.vars file
 */
import { getPrisma, type PrismaClient } from './lib/db.js'
import { tipQueue, type QueueMessage } from './lib/queue.js'

export interface Env {
  DB: PrismaClient
  TIP_QUEUE: { send: (msg: QueueMessage) => Promise<void> }
  // AI & Blockchain
  GEMINI_API_KEY: string
  WDK_MASTER_SEED: string
  BASE_RPC_URL: string
  POLYGON_RPC_URL: string
  // GitHub OAuth
  GITHUB_CLIENT_ID: string
  GITHUB_CLIENT_SECRET: string
  GITHUB_TOKEN: string
  // Discord
  DISCORD_BOT_TOKEN: string
  DISCORD_WEBHOOK_SECRET: string
  // URLs
  API_URL: string
  FRONTEND_URL: string
  // Runtime config
  ENVIRONMENT: string
  PRIMARY_CHAIN: string
  LIQUID_RESERVE_USDT: string
  YIELD_ENABLED: string
}

export function getEnv(): Env {
  return {
    DB: getPrisma(),
    TIP_QUEUE: { send: (msg) => tipQueue.send(msg) },
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    WDK_MASTER_SEED: process.env.WDK_MASTER_SEED || '',
    BASE_RPC_URL: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    POLYGON_RPC_URL: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
    GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
    DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
    DISCORD_WEBHOOK_SECRET: process.env.DISCORD_WEBHOOK_SECRET || '',
    API_URL: process.env.API_URL || 'http://localhost:3000',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    ENVIRONMENT: process.env.ENVIRONMENT || 'development',
    PRIMARY_CHAIN: process.env.PRIMARY_CHAIN || 'base',
    LIQUID_RESERVE_USDT: process.env.LIQUID_RESERVE_USDT || '50',
    YIELD_ENABLED: process.env.YIELD_ENABLED || 'true',
  }
}
