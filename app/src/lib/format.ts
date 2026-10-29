import { formatUnits, parseUnits, BaseError, ContractFunctionRevertedError } from 'viem'

const USDC_DECIMALS = 6

/** Format a bigint USDC raw value to a display string (default 2 decimals). */
export function fmtUsdc(raw: bigint | undefined | null, maxDecimals = 2): string {
  if (raw === undefined || raw === null) return '—'
  const s = formatUnits(raw, USDC_DECIMALS)
  const n = Number(s)
  // Show up to 6 decimals but trim trailing zeros beyond maxDecimals
  if (maxDecimals <= 2) return n.toFixed(2)
  // trim trailing zeros, keep at least 2 decimal places
  const full = n.toFixed(6)
  const trimmed = full.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '.00')
  return trimmed
}

/** Format with localeString for larger display amounts. */
export function fmtUsdcFull(raw: bigint | undefined): string {
  if (raw === undefined) return '—'
  const s = formatUnits(raw, USDC_DECIMALS)
  return Number(s).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

/** Parse a user-typed USDC decimal string to bigint raw (6 decimals). Uses viem parseUnits. */
export function parseUsdcInput(value: string): bigint {
  if (!value || value === '.') return 0n
  try {
    return parseUnits(value, USDC_DECIMALS)
  } catch {
    return 0n
  }
}

export function fmtAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function fmtSeconds(s: number | bigint): string {
  const n = Number(s)
  if (n === 0) return '0s'
  if (n < 60) return `${n}s`
  if (n < 3600) return `${Math.floor(n / 60)}m ${n % 60}s`
  const h = Math.floor(n / 3600)
  const m = Math.floor((n % 3600) / 60)
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function fmtDateUtc(ts: number | bigint): string {
  if (!ts) return '—'
  const n = Number(ts)
  if (n === 0) return '—'
  return new Date(n * 1000).toUTCString().replace(' GMT', ' UTC')
}

export function fmtDate(ts: number | bigint): string {
  if (!ts) return '—'
  const n = Number(ts)
  if (n === 0) return '—'
  return new Date(n * 1000).toLocaleString()
}

// ─── Error decoding ───────────────────────────────────────────────────────────

const ERROR_NAME_MAP: Record<string, string> = {
  NotEmployer:                 'Only the employer wallet can do this.',
  NotWorker:                   'Connect the worker wallet assigned to this shift.',
  InvalidStatus:               "This action isn't available at this stage.",
  AttestedTooLong:             'Attested hours exceed the shift maximum.',
  NothingToClaim:              'No pay is due on this shift.',
  NothingToRefund:             'No unused funds remain.',
  InvalidAmount:               'Check the rate and hours; the budget is outside the allowed range.',
  InvalidDuration:             'Check the rate and hours; the budget is outside the allowed range.',
  DurationTooLong:             'Shift duration exceeds the contract maximum.',
  EscrowTooLarge:              'Check the rate and hours; the budget is outside the allowed range.',
  InvalidDecimals:             'The token is not Arc USDC (6 decimals).',
  InvalidWorker:               'The worker address is invalid.',
  ZeroAddress:                 'Address cannot be zero.',
  SafeERC20FailedOperation:    'USDC transfer failed. The address may be blocked, or the balance is insufficient.',
  TooManyIds:                  'Too many shift IDs in one call.',
  ReentrancyGuardReentrantCall:'Reentrancy detected.',
}

export function decodeContractError(err: unknown): string {
  // viem structured path
  if (err instanceof BaseError) {
    const revert = err.walk(e => e instanceof ContractFunctionRevertedError)
    if (revert instanceof ContractFunctionRevertedError) {
      const name = revert.data?.errorName ?? ''
      if (name && ERROR_NAME_MAP[name]) return ERROR_NAME_MAP[name]
      if (name) return `Contract error: ${name}`
    }
    // user rejected
    const msg = err.message.toLowerCase()
    if (msg.includes('user rejected') || msg.includes('user denied') || msg.includes('4001')) {
      return 'Transaction cancelled in your wallet.'
    }
    if (msg.includes('insufficient') && msg.includes('gas')) {
      return 'Add USDC for gas; Arc transactions need at least 20 Gwei and enough balance for the fee.'
    }
    // try to extract custom error name from message text
    for (const name of Object.keys(ERROR_NAME_MAP)) {
      if (err.message.includes(name)) return ERROR_NAME_MAP[name]
    }
    // short message fallback
    return err.shortMessage ?? err.message.split('\n')[0]
  }
  // plain Error / string fallback
  const msg = (err as { message?: string })?.message ?? String(err)
  if (msg.toLowerCase().includes('user rejected') || msg.includes('4001')) {
    return 'Transaction cancelled in your wallet.'
  }
  for (const name of Object.keys(ERROR_NAME_MAP)) {
    if (msg.includes(name)) return ERROR_NAME_MAP[name]
  }
  if (msg.toLowerCase().includes('reverted')) return 'Transaction reverted. Check inputs and try again.'
  return 'Something went wrong. Please try again.'
}
