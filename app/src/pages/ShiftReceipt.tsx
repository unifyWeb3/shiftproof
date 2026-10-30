/**
 * /shift/:id — Public read-only receipt.
 * No write buttons. Shows full tuple, status, timestamps, tx hashes, explorer links.
 */
import { useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import {
  ABI, CONTRACT_ADDRESS, USDC_ADDRESS, CHAIN_ID, CHAIN_NAME,
  type ShiftTuple, explorerAddr, explorerTx,
} from '../lib/contract'
import { fmtAddr, fmtUsdc, fmtSeconds, fmtDate, fmtDateUtc } from '../lib/format'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'
import {
  addCreatedShift, addAssignedShift,
  getShiftTxRecord, type ShiftTxRecord,
} from '../lib/storage'
import StatusBadge from '../components/StatusBadge'
import { usePath } from '../lib/router'
import { shiftShareUrl } from '../lib/share'

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

interface Props { shiftId: number }

export default function ShiftReceipt({ shiftId }: Props) {
  const [,] = usePath()
  const { address } = useAccount()

  const { data, isLoading, isError, refetch } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'getShift',
    args: [BigInt(shiftId)],
    chainId: CHAIN_ID,
    query: { enabled: hasContract, refetchInterval: 10000 },
  })

  const shift = data as ShiftTuple | undefined

  // Auto-track for convenience
  useEffect(() => {
    if (!shift || !address) return
    if (shift.employer.toLowerCase() === address.toLowerCase()) addCreatedShift(shiftId)
    if (shift.worker.toLowerCase()   === address.toLowerCase()) addAssignedShift(shiftId)
  }, [shift, address, shiftId])

  const txRec: ShiftTxRecord = getShiftTxRecord(shiftId)

  if (!hasContract) return (
    <div className="space-y-4">
      <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
        <ArrowLeft className="size-4" /> Back
      </button>
      <div className="rounded-2xl p-5 text-center" style={glass}>
        <p className="font-semibold" style={{ color: 'var(--danger)' }}>Not deployed on this network</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          ShiftProof has no contract on {ACTIVE_NETWORK.label}, so shift #{shiftId} cannot be read here.
        </p>
      </div>
    </div>
  )

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <div className="size-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading shift {shiftId}…</p>
    </div>
  )

  if (isError || !shift || shift.status === 0) return (
    <div className="space-y-4">
      <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
        <ArrowLeft className="size-4" /> Back
      </button>
      <div className="rounded-2xl p-5 text-center" style={glass}>
        <p className="font-semibold" style={{ color: 'var(--danger)' }}>Shift not found</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          No shift #{shiftId} exists on this contract.
        </p>
      </div>
    </div>
  )

  const shareUrl = shiftShareUrl(shiftId)

  const detail: { label: string; value: string; link?: string; mono?: boolean }[] = [
    { label: 'Shift ID',     value: String(shiftId) },
    { label: 'Status',       value: '' }, // rendered separately as badge
    { label: 'Employer',     value: fmtAddr(shift.employer), link: explorerAddr(shift.employer), mono: true },
    { label: 'Worker',       value: fmtAddr(shift.worker),   link: explorerAddr(shift.worker),   mono: true },
    { label: 'Rate',         value: `${fmtUsdc(shift.hourlyRate)} USDC/hr` },
    { label: 'Max duration', value: fmtSeconds(shift.maxSeconds) },
    { label: 'Escrow',       value: `${fmtUsdc(shift.escrow)} USDC` },
  ]
  if (shift.owed > 0n) {
    detail.push({ label: 'Owed (attested)', value: `${fmtUsdc(shift.owed)} USDC` })
    detail.push({ label: 'Attested',        value: fmtSeconds(shift.attestedSeconds) })
  }
  if (shift.createdAt > 0n) {
    detail.push({ label: 'Created (UTC)', value: fmtDateUtc(shift.createdAt) })
    detail.push({ label: 'Created (local)', value: fmtDate(shift.createdAt) })
  }
  if (shift.startedAt > 0n) {
    detail.push({ label: 'Clocked in (UTC)',  value: fmtDateUtc(shift.startedAt) })
    detail.push({ label: 'Clocked in (local)', value: fmtDate(shift.startedAt) })
  }
  if (shift.endedAt > 0n) {
    detail.push({ label: 'Clocked out (UTC)',  value: fmtDateUtc(shift.endedAt) })
    detail.push({ label: 'Clocked out (local)', value: fmtDate(shift.endedAt) })
  }

  // Transaction hashes from local record
  const knownTxs: { label: string; hash: string }[] = []
  if (txRec.create)   knownTxs.push({ label: 'Create', hash: txRec.create })
  if (txRec.clockIn)  knownTxs.push({ label: 'Clock-in', hash: txRec.clockIn })
  if (txRec.clockOut) knownTxs.push({ label: 'Clock-out', hash: txRec.clockOut })
  if (txRec.attest)   knownTxs.push({ label: 'Attest', hash: txRec.attest })
  if (txRec.claim)    knownTxs.push({ label: 'Claim', hash: txRec.claim })
  if (txRec.refund)   knownTxs.push({ label: 'Refund', hash: txRec.refund })
  if (txRec.cancel)   knownTxs.push({ label: 'Cancel', hash: txRec.cancel })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
          <ArrowLeft className="size-4" /> Back
        </button>
        <button onClick={() => { void refetch() }} className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted)' }}>
          <RefreshCw className="size-3" /> Refresh
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Shift #{shiftId}</h1>
        <StatusBadge status={shift.status} />
      </div>

      {/* Main detail */}
      <div className="rounded-3xl overflow-hidden" style={glass}>
        <div className="px-5 py-4 space-y-2.5">
          {detail.filter(r => r.label !== 'Status').map(r => (
            <div key={r.label} className="flex items-start justify-between gap-2">
              <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{r.label}</span>
              {r.link ? (
                <a href={r.link} target="_blank" rel="noreferrer"
                  className={`text-xs font-medium flex items-center gap-0.5 underline text-right ${r.mono ? 'mono' : ''}`}
                  style={{ color: 'var(--ink-2)' }}>
                  {r.value}<ExternalLink className="size-2.5 shrink-0" />
                </a>
              ) : (
                <span className={`text-xs font-medium tabular-nums text-right ${r.mono ? 'mono' : ''}`} style={{ color: 'var(--ink)' }}>
                  {r.value}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Known tx hashes */}
      <div className="rounded-2xl p-4 space-y-2" style={glass}>
        <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Transaction hashes</p>
        {knownTxs.length > 0 ? (
          knownTxs.map(t => (
            <div key={t.label} className="flex items-center justify-between gap-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{t.label}</span>
              <a href={explorerTx(t.hash)} target="_blank" rel="noreferrer"
                className="mono text-xs flex items-center gap-0.5" style={{ color: 'var(--accent-hover)' }}>
                {fmtAddr(t.hash)}<ExternalLink className="size-2.5" />
              </a>
            </div>
          ))
        ) : (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            No tx hashes in this browser's record. Full history is available on the explorer.
          </p>
        )}
        <a href={explorerAddr(CONTRACT_ADDRESS)}
          target="_blank" rel="noreferrer"
          className="text-xs flex items-center gap-0.5" style={{ color: 'var(--accent-hover)' }}>
          Search all txs on explorer<ExternalLink className="size-2.5" />
        </a>
      </div>

      {/* Share + verify */}
      <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={glass}>
        <span className="text-xs truncate max-w-[200px]" style={{ color: 'var(--muted)' }}>{shareUrl}</span>
        <button onClick={() => { void navigator.clipboard.writeText(shareUrl).catch(() => {}) }}
          className="text-xs font-semibold" style={{ color: 'var(--accent-hover)' }}>
          Copy link
        </button>
      </div>

      {/* Explorer footer */}
      <div className="rounded-2xl px-4 py-3 space-y-1.5" style={glass}>
        <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Verify onchain</p>
        <div className="flex flex-wrap gap-3">
          <a href={explorerAddr(CONTRACT_ADDRESS)}
            target="_blank" rel="noreferrer"
            className="text-xs flex items-center gap-0.5" style={{ color: 'var(--accent-hover)' }}>
            Contract<ExternalLink className="size-2.5" />
          </a>
          <a href={explorerAddr(USDC_ADDRESS)}
            target="_blank" rel="noreferrer"
            className="text-xs flex items-center gap-0.5" style={{ color: 'var(--accent-hover)' }}>
            USDC token<ExternalLink className="size-2.5" />
          </a>
        </div>
        <p className="mono text-xs break-all" style={{ color: 'var(--subtle)' }}>
          {CONTRACT_ADDRESS} · {CHAIN_NAME} (chain {CHAIN_ID})
        </p>
      </div>
    </div>
  )
}
