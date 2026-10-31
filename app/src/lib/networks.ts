/**
 * Single network configuration file.
 * All chain facts live here; no other source file may hardcode
 * explorer URLs, RPC URLs, chain IDs, or contract addresses.
 */

export type NetworkKey = 'testnet' | 'mainnet'

export interface NetworkConfig {
  key: NetworkKey
  label: string
  chainId: number
  rpcUrl: string
  explorerUrl: string
  usdcAddress: `0x${string}`
  usdcDecimals: number
  nativeDecimals: number
  /** Null until deployed on this network. */
  contractAddress: `0x${string}` | null
  deploymentBlock: bigint | null
  deploymentTx: `0x${string}` | null
  isTestnet: boolean
  /** True when contractAddress is known and verified. */
  isConfigured: boolean
  faucetUrl?: string
}

export const NETWORKS: Record<NetworkKey, NetworkConfig> = {
  testnet: {
    key: 'testnet',
    label: 'Arc Testnet',
    chainId: 5042002,
    rpcUrl: 'https://rpc.testnet.arc.io',
    explorerUrl: 'https://explorer.testnet.arc.io',
    usdcAddress: '0x3600000000000000000000000000000000000000',
    usdcDecimals: 6,
    nativeDecimals: 18,
    contractAddress: '0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6',
    deploymentBlock: 69263663n,
    deploymentTx: '0x89b616d394bd6b834901e24d3651fd05bdcbe4d84dae64befeb5fc5f40dcfd52',
    isTestnet: true,
    isConfigured: true,
    faucetUrl: 'https://faucet.circle.com',
  },
  mainnet: {
    key: 'mainnet',
    label: 'Arc',
    chainId: 5042,
    rpcUrl: 'https://rpc.mainnet.arc.io',
    explorerUrl: 'https://explorer.arc.io',
    usdcAddress: '0x3600000000000000000000000000000000000000',
    usdcDecimals: 6,
    nativeDecimals: 18,
    contractAddress: '0x2A88dDe461280F5a3Ad959fd6997388409e766a9',
    deploymentBlock: 28736878n,
    deploymentTx: '0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98',
    isTestnet: false,
    isConfigured: true,
  },
}

// ─── Active network (from VITE_NETWORK env var, default testnet) ─────────────

const rawKey = import.meta.env.VITE_NETWORK ?? 'testnet'
if (rawKey !== 'testnet' && rawKey !== 'mainnet') {
  throw new Error(
    `VITE_NETWORK="${rawKey}" is not a known network key. Valid values: testnet, mainnet`,
  )
}
export const ACTIVE_NETWORK_KEY: NetworkKey = rawKey
export const ACTIVE_NETWORK: NetworkConfig = NETWORKS[ACTIVE_NETWORK_KEY]

/**
 * A configured network is only usable when every deployment fact is present
 * and well-formed. Missing or malformed mainnet data fails closed: callers see
 * hasContract=false and all contract reads/writes stay disabled.
 */
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/
const TX_HASH_RE = /^0x[0-9a-fA-F]{64}$/

function isValidConfiguredNetwork(network: NetworkConfig): boolean {
  if (!network.isConfigured) return false
  if (!network.contractAddress || !ADDRESS_RE.test(network.contractAddress)) return false
  if (network.deploymentBlock === null || network.deploymentBlock <= 0n) return false
  if (!network.deploymentTx || !TX_HASH_RE.test(network.deploymentTx)) return false
  if (!ADDRESS_RE.test(network.usdcAddress)) return false
  return true
}

/** True only when the active network has a complete, well-formed deployment. */
export const hasContract: boolean = isValidConfiguredNetwork(ACTIVE_NETWORK)

// ─── Explorer helpers ─────────────────────────────────────────────────────────

export function explorerTx(hash: string): string {
  return `${ACTIVE_NETWORK.explorerUrl}/tx/${hash}`
}

export function explorerAddr(address: string): string {
  return `${ACTIVE_NETWORK.explorerUrl}/address/${address}`
}
