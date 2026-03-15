import { base, polygon } from 'viem/chains'
export const SUPPORTED_CHAINS = {
  base: {
    chain: base,
    usdtAddress: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2" as `0x${string}`,
    aavePool:    "0xA238Dd80C259a72e81d7e4664317d3e1bce696b3" as `0x${string}`,
    aUSDT:       "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8" as `0x${string}`,
    blockExplorer: "https://basescan.org"
  },
  polygon: {
    chain: polygon,
    usdtAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F" as `0x${string}`,
    aavePool:    "0x794a61358D6845594F94dc1DB02A252b5b4814aD" as `0x${string}`,
    aUSDT:       "0x625E7708f30cA75bfd92586e17077590C60eb4cD" as `0x${string}`,
    blockExplorer: "https://polygonscan.com"
  },
} as const
export type SupportedChain = keyof typeof SUPPORTED_CHAINS
