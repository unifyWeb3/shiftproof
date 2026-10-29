/**
 * localStorage cache — spec §12.4.
 * Keys: shiftproof:<chainId>:<contract>:created | assigned | lastRead
 * No PII. Shift IDs only. Clearing this loses convenience, not funds.
 */

import { CHAIN_ID, CONTRACT_ADDRESS } from './contract'

const pfx = `shiftproof:${CHAIN_ID}:${CONTRACT_ADDRESS.toLowerCase()}`

const KEY_CREATED  = `${pfx}:created`
const KEY_ASSIGNED = `${pfx}:assigned`
const KEY_LAST_READ = `${pfx}:lastRead`
// per-shift known tx hashes
const txKey = (id: number) => `${pfx}:tx:${id}`

function safeGet(key: string): number[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((v): v is number => typeof v === 'number')
  } catch {
    return []
  }
}

function safeSet(key: string, ids: number[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(ids))
  } catch { /* quota exceeded */ }
}

function addId(key: string, id: number): void {
  const existing = safeGet(key)
  if (!existing.includes(id)) safeSet(key, [id, ...existing].slice(0, 100))
}

// ─── created (employer) ───────────────────────────────────────────────────────
export function addCreatedShift(id: number): void { addId(KEY_CREATED, id) }
export function getCreatedShifts(): number[] { return safeGet(KEY_CREATED) }

// ─── assigned (worker) ───────────────────────────────────────────────────────
export function addAssignedShift(id: number): void { addId(KEY_ASSIGNED, id) }
export function getAssignedShifts(): number[] { return safeGet(KEY_ASSIGNED) }

// ─── last scanned block ───────────────────────────────────────────────────────
export function getLastReadBlock(): bigint {
  try {
    const v = localStorage.getItem(KEY_LAST_READ)
    return v ? BigInt(v) : 0n
  } catch { return 0n }
}
export function setLastReadBlock(block: bigint): void {
  try { localStorage.setItem(KEY_LAST_READ, block.toString()) } catch { /* quota */ }
}

// ─── per-shift tx hash record ─────────────────────────────────────────────────
export interface ShiftTxRecord {
  create?: string
  clockIn?: string
  clockOut?: string
  attest?: string
  claim?: string
  refund?: string
  cancel?: string
}

export function getShiftTxRecord(id: number): ShiftTxRecord {
  try {
    const raw = localStorage.getItem(txKey(id))
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return parsed
  } catch { return {} }
}

export function updateShiftTxRecord(id: number, update: Partial<ShiftTxRecord>): void {
  const existing = getShiftTxRecord(id)
  try {
    localStorage.setItem(txKey(id), JSON.stringify({ ...existing, ...update }))
  } catch { /* quota */ }
}

// ─── legacy compat shims (keep old code from crashing) ────────────────────────
export function addEmployerShift(_addr: string, id: number): void { addCreatedShift(id) }
export function addWorkerShift(_addr: string, id: number): void { addAssignedShift(id) }
export function getEmployerShifts(_addr: string): number[] { return getCreatedShifts() }
export function getWorkerShifts(_addr: string): number[] { return getAssignedShifts() }
