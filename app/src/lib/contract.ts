/**
 * Contract facts — single source of truth from deployments.json + compiled artifact.
 * Do NOT duplicate addresses or chain IDs elsewhere.
 */
import deployments from '../../deployments.json'
import artifact from '../../contracts/out/ShiftProof.sol/ShiftProof.json'

export const ABI = artifact.abi

export const CHAIN_ID         = deployments.ShiftProof.arcTestnet.chainId  // 5042002
export const CONTRACT_ADDRESS = deployments.ShiftProof.arcTestnet.address as `0x${string}`
export const USDC_ADDRESS     = deployments.ShiftProof.arcTestnet.usdc as `0x${string}`
export const DEPLOYMENT_BLOCK = BigInt(deployments.ShiftProof.arcTestnet.deploymentBlock)
export const DEPLOYMENT_TX    = deployments.ShiftProof.arcTestnet.txHash
export const EXPLORER_BASE    = 'https://explorer.testnet.arc.io'
export const CHAIN_NAME       = 'Arc Testnet'
export const CHAIN_RPC        = 'https://rpc.testnet.arc.io'

export const explorerTx   = (hash: string) => `${EXPLORER_BASE}/tx/${hash}`
export const explorerAddr = (addr: string) => `${EXPLORER_BASE}/address/${addr}`

// ─── Shift tuple — exactly mirrors getShift() output ─────────────────────────
// Fields: employer, worker, createdAt, startedAt, endedAt, maxSeconds,
//         attestedSeconds, hourlyRate, escrow, owed, status
export interface ShiftTuple {
  employer:        `0x${string}`
  worker:          `0x${string}`
  createdAt:       bigint   // uint64
  startedAt:       bigint   // uint64
  endedAt:         bigint   // uint64
  maxSeconds:      number   // uint32
  attestedSeconds: number   // uint32
  hourlyRate:      bigint   // uint256 (6-decimal USDC)
  escrow:          bigint   // uint256 (6-decimal USDC)
  owed:            bigint   // uint256 (6-decimal USDC)
  status:          number   // uint8
}

// Convenience: shift ID + tuple together
export interface ShiftWithId extends ShiftTuple {
  id: number
}

// ─── Status labels and colours ────────────────────────────────────────────────
export const STATUS_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Funded',
  2: 'Active',
  3: 'Awaiting Attestation',
  4: 'Attested',
  5: 'Claimed',
  6: 'Settled',
  7: 'Cancelled',
}

export const STATUS_COLORS: Record<number, string> = {
  0: '#8a849c',
  1: '#1061a6',
  2: '#1a8047',
  3: '#d97706',
  4: '#7c3aed',
  5: '#0284c7',
  6: '#1a8047',
  7: '#ba2b4c',
}
