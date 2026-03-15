/**
 * Database wrapper using Prisma
 */
import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export async function initDb() {
  const client = getPrisma()
  try {
    // Test connection
    await client.$connect()
    console.log('[DB] Prisma connected to PostgreSQL')
  } catch (e) {
    console.error('[DB] Failed to connect:', e)
    throw e
  }
}

export async function disconnectDb() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

// Export prisma instance for direct use
export { PrismaClient }
export type { PrismaClient as DB }
