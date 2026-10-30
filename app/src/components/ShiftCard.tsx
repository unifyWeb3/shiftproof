import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { fmtAddr, fmtUsdc, fmtSeconds, fmtDate } from '../lib/format'
import { explorerAddr, explorerTx, CONTRACT_ADDRESS, CHAIN_ID, USDC_ADDRESS, type ShiftTuple } from '../lib/contract'
import { shiftShareUrl } from '../lib/share'
import StatusBadge from './StatusBadge'
import { usePath } from '../lib/router'

export interface ShiftCardProps {
  id: number
  shift: ShiftTuple
  txHash?: string
}

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

export default function ShiftCard({ id, shift, txHash }: ShiftCardProps) {
  const [, navigate] = usePath()
  const [copied, setCopied] = useState(false)

  const copyLink = () => {
    void navigator.clipboard.writeText(shiftShareUrl(id)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const rows: { label: string; value: string; mono?: boolean; link?: string }[] = [
    { label: 'Employer', value: fmtAddr(shift.employer), mono: true, link: explorerAddr(shift.employer) },
    { label: 'Worker',   value: fmtAddr(shift.worker),   mono: true, link: explorerAddr(shift.worker) },
    { label: 'Rate',     value: `${fmtUsdc(shift.hourlyRate)} USDC/hr` },
    { label: 'Max duration', value: fmtSeconds(shift.maxSeconds) },
    { label: 'Escrow',   value: `${fmtUsdc(shift.escrow)} USDC` },
  ]

  if (shift.owed > 0n) {
    rows.push({ label: 'Owed', value: `${fmtUsdc(shift.owed)} USDC` })
    rows.push({ label: 'Attested', value: fmtSeconds(shift.attestedSeconds) })
  }
  if (shift.createdAt > 0n)  rows.push({ label: 'Created',     value: fmtDate(shift.createdAt) })
  if (shift.startedAt > 0n)  rows.push({ label: 'Clocked in',  value: fmtDate(shift.startedAt) })
  if (shift.endedAt > 0n)    rows.push({ label: 'Clocked out', value: fmtDate(shift.endedAt) })

  return (
    <div className="rounded-3xl overflow-hidden" style={glass}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="display text-lg font-bold" style={{ color: 'var(--ink)' }}>Shift #{id}</span>
          <StatusBadge status={shift.status} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyLink} title="Copy share link"
            className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}>
            {copied ? <Check className="size-4" style={{ color: 'var(--success)' }} /> : <Copy className="size-4" />}
          </button>
          <button onClick={() => navigate(`/shift/${id}`)} title="View receipt"
            className="flex size-8 items-center justify-center rounded-xl"
            style={{ background: 'var(--surface-muted)', color: 'var(--muted)' }}>
            <ExternalLink className="size-4" />
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="px-5 py-4 space-y-2">
        {rows.map(r => (
          <div key={r.label} className="flex items-center justify-between gap-2">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>{r.label}</span>
            {r.link ? (
              <a href={r.link} target="_blank" rel="noreferrer"
                className="text-xs font-medium mono flex items-center gap-0.5 underline"
                style={{ color: 'var(--ink-2)' }}>
                {r.value}<ExternalLink className="size-2.5" />
              </a>
            ) : (
              <span className={`text-xs font-medium tabular-nums ${r.mono ? 'mono' : ''}`} style={{ color: 'var(--ink)' }}>
                {r.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {txHash && (
        <div className="px-5 pb-3 flex items-center justify-between">
          <span className="text-xs" style={{ color: 'var(--muted)' }}>Latest tx</span>
          <a href={explorerTx(txHash)} target="_blank" rel="noreferrer"
            className="mono text-xs flex items-center gap-0.5" style={{ color: 'var(--accent-hover)' }}>
            {fmtAddr(txHash)}<ExternalLink className="size-2.5" />
          </a>
        </div>
      )}

      <div className="px-5 pb-4">
        <a href={explorerAddr(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer"
          className="text-xs" style={{ color: 'var(--subtle)' }}>
          Contract · chain {CHAIN_ID}
        </a>
        {' · '}
        <a href={explorerAddr(USDC_ADDRESS)} target="_blank" rel="noreferrer"
          className="text-xs" style={{ color: 'var(--subtle)' }}>
          USDC
        </a>
      </div>
    </div>
  )
}
