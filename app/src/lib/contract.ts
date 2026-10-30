/**
 * Contract facts — derived entirely from ACTIVE_NETWORK in networks.ts.
 * Do NOT hardcode addresses, chain IDs, or explorer URLs here.
 */
import artifact from '../../contracts/out/ShiftProof.sol/ShiftProof.json'
import { ACTIVE_NETWORK, explorerTx as _explorerTx, explorerAddr as _explorerAddr } from './networks'

export const ABI = artifact.abi

// Re-export from the active network so consumers need only one import.
export const CHAIN_ID         = ACTIVE_NETWORK.chainId
export const CHAIN_NAME       = ACTIVE_NETWORK.label
export const CHAIN_RPC        = ACTIVE_NETWORK.rpcUrl
export const EXPLORER_BASE    = ACTIVE_NETWORK.explorerUrl
export const USDC_ADDRESS     = ACTIVE_NETWORK.usdcAddress
export const DEPLOYMENT_BLOCK = ACTIVE_NETWORK.deploymentBlock
export const DEPLOYMENT_TX    = ACTIVE_NETWORK.deploymentTx ?? ''

// CONTRACT_ADDRESS is only valid when isConfigured; callers must check hasContract first.
export const CONTRACT_ADDRESS = (ACTIVE_NETWORK.contractAddress ?? '0x0000000000000000000000000000000000000000')

export const explorerTx   = _explorerTx
export const explorerAddr = _explorerAddr

// ─── Shift tuple — exactly mirrors getShift() output ─────────────────────────
export interface ShiftTuple {
  employer:        `0x${string}`
  worker:          `0x${string}`
  createdAt:       bigint
  startedAt:       bigint
  endedAt:         bigint
  maxSeconds:      number
  attestedSeconds: number
  hourlyRate:      bigint
  escrow:          bigint
  owed:            bigint
  status:          number
}

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
