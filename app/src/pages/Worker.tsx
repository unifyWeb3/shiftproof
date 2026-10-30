import { useState } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { erc20Abi } from 'viem'
import { Plus, RefreshCw } from 'lucide-react'
import {
  ABI, CONTRACT_ADDRESS, USDC_ADDRESS, CHAIN_ID,
  STATUS_LABELS, type ShiftTuple,
} from '../lib/contract'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'
import { fmtUsdc, fmtAddr, fmtSeconds } from '../lib/format'
import {
  addAssignedShift, getAssignedShifts,
  updateShiftTxRecord,
} from '../lib/storage'
import NetworkGuard, { useWrongChain } from '../components/NetworkGuard'
import StatusBadge from '../components/StatusBadge'
import TxButton from '../components/TxButton'
import { usePath } from '../lib/router'

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

function useShift(id: number | null) {
  return useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'getShift',
    args: id !== null ? [BigInt(id)] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: id !== null && hasContract, refetchInterval: 8000 },
  })
}

function ShiftRow({ id, onSelect }: { id: number; onSelect: (id: number) => void }) {
  const { data } = useShift(id)
  const s = data as ShiftTuple | undefined
  return (
    <button onClick={() => onSelect(id)}
      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-colors hover:bg-white/60"
      style={{ border: '1px solid var(--border)' }}>
      <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Shift #{id}</span>
      <div className="flex items-center gap-2">
        {s && <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>{fmtUsdc(s.owed > 0n ? s.owed : s.escrow)} USDC</span>}
        {s ? <StatusBadge status={s.status} size="sm" /> : <span className="text-xs" style={{ color: 'var(--subtle)' }}>loading…</span>}
      </div>
    </button>
  )
}

export default function Worker() {
  const { address, isConnected } = useAccount()
  const wrongChain = useWrongChain()
  const [, navigate] = usePath()

  const [actionId, setActionId] = useState<number | null>(null)
  const [actionStatus, setActionStatus] = useState<string | null>(null)
  const [manualId, setManualId] = useState('')

  const [refreshKey, setRefreshKey] = useState(0)
  void refreshKey
  const myShifts = getAssignedShifts()
  const refresh = () => setRefreshKey(k => k + 1)

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS, abi: erc20Abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 8000 },
  }) as { data: bigint | undefined }

  const selectedShift = useShift(actionId)
  const shiftData = selectedShift.data as ShiftTuple | undefined

  // Role check
  const isWorker = !!(address && shiftData &&
    shiftData.worker.toLowerCase() === address.toLowerCase())

  // Args — always built; disabledReason gates whether TxButton actually fires
  const clockInArgs  = actionId !== null ? { address: CONTRACT_ADDRESS, abi: ABI, functionName: 'clockIn',  args: [BigInt(actionId)] } : null
  const clockOutArgs = actionId !== null ? { address: CONTRACT_ADDRESS, abi: ABI, functionName: 'clockOut', args: [BigInt(actionId)] } : null
  const claimArgs    = actionId !== null ? { address: CONTRACT_ADDRESS, abi: ABI, functionName: 'claim',    args: [BigInt(actionId)] } : null

  const workerReason = (action: string) => {
    if (!isConnected) return `Connect wallet to ${action}.`
    if (wrongChain)   return `Wrong network — switch to ${ACTIVE_NETWORK.label}.`
    if (!shiftData)   return `Load a shift ID first.`
    if (!isWorker)    return `Only the assigned worker (${fmtAddr(shiftData.worker)}) can ${action}.`
    return undefined
  }

  const clockInReason  = workerReason('clock in')  ?? (shiftData?.status !== 1 ? `Shift status is ${STATUS_LABELS[shiftData!.status]}; clock in requires Funded.` : undefined)
  const clockOutReason = workerReason('clock out') ?? (shiftData?.status !== 2 ? `Shift status is ${STATUS_LABELS[shiftData!.status]}; clock out requires Active.` : undefined)
  const claimReason    = workerReason('claim')     ?? (shiftData?.status !== 4 ? `Shift status is ${STATUS_LABELS[shiftData!.status]}; claim requires Attested.` : undefined)

  const onSuccess = (hash: `0x${string}`, type: 'clockIn' | 'clockOut' | 'claim') => {
    if (actionId !== null) updateShiftTxRecord(actionId, { [type]: hash })
    setActionStatus(`Done! Tx: ${fmtAddr(hash)}`)
    void selectedShift.refetch()
  }

  return (
    <div className="space-y-5">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Worker</h1>

      <NetworkGuard>
        {isConnected && (
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={glass}>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Your USDC (ERC-20)</span>
            <span className="display text-lg font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {usdcBalance !== undefined ? fmtUsdc(usdcBalance) : '...'} USDC
            </span>
          </div>
        )}

        <section className="rounded-3xl p-5 space-y-4" style={glass}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Shift actions</h2>

          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Shift ID</label>
            <div className="flex gap-2">
              <input inputMode="numeric"
                value={actionId !== null ? String(actionId) : ''}
                onChange={e => { const n=parseInt(e.target.value,10); setActionId(isNaN(n)?null:n); setActionStatus(null) }}
                placeholder="e.g. 1"
                className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none tabular-nums"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
              <button onClick={() => { void selectedShift.refetch() }}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--muted)' }}>
                <RefreshCw className="size-4" />
              </button>
            </div>
          </div>

          {shiftData && (
            <div className="rounded-xl px-3 py-2 space-y-1" style={{ background: 'var(--surface-muted)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Status</span>
                <StatusBadge status={shiftData.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Employer</span>
                <span className="text-xs mono" style={{ color: 'var(--ink)' }}>{fmtAddr(shiftData.employer)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Worker</span>
                <span className="text-xs mono" style={{ color: 'var(--ink)' }}>{fmtAddr(shiftData.worker)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Rate</span>
                <span className="text-xs tabular-nums font-medium" style={{ color: 'var(--ink)' }}>
                  {fmtUsdc(shiftData.hourlyRate)} USDC/hr
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Max duration</span>
                <span className="text-xs tabular-nums" style={{ color: 'var(--ink)' }}>
                  {fmtSeconds(shiftData.maxSeconds)}
                </span>
              </div>
              {shiftData.owed > 0n && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>Owed (attested)</span>
                  <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--success)' }}>
                    {fmtUsdc(shiftData.owed)} USDC
                  </span>
                </div>
              )}
              {address && shiftData && !isWorker && (
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Connected wallet is not the assigned worker ({fmtAddr(shiftData.worker)}).
                </p>
              )}
            </div>
          )}

          {/* Clock In — always shown when a shift is loaded */}
          {shiftData && (
            <TxButton txArgs={clockInReason ? null : clockInArgs}
              label="Clock in"
              shiftId={actionId ?? undefined}
              detail="Records your start time onchain. Shift moves to Active."
              onSuccess={h => onSuccess(h, 'clockIn')}
              disabled={!!clockInReason}
              disabledReason={clockInReason} />
          )}

          {/* Clock Out — always shown when a shift is loaded */}
          {shiftData && (
            <TxButton txArgs={clockOutReason ? null : clockOutArgs}
              label="Clock out"
              shiftId={actionId ?? undefined}
              detail="Records your end time onchain. Employer can now attest hours."
              onSuccess={h => onSuccess(h, 'clockOut')}
              disabled={!!clockOutReason}
              disabledReason={clockOutReason} />
          )}

          {/* Claim — always shown when a shift is loaded */}
          {shiftData && (
            <div className="space-y-2">
              {!claimReason && shiftData.owed > 0n && (
                <div className="rounded-xl px-3 py-2"
                  style={{ background: 'rgba(26,128,71,0.08)', border: '1px solid rgba(26,128,71,0.2)' }}>
                  <p className="text-xs" style={{ color: 'var(--success)' }}>
                    Ready to claim {fmtUsdc(shiftData.owed)} USDC (owed field from contract)
                  </p>
                </div>
              )}
              <TxButton txArgs={claimReason ? null : claimArgs}
                label={shiftData.owed > 0n && !claimReason ? `Claim ${fmtUsdc(shiftData.owed)} USDC` : 'Claim USDC'}
                shiftId={actionId ?? undefined}
                amount={shiftData.owed > 0n ? shiftData.owed : undefined}
                detail="Transfers owed USDC to you. Any unused escrow stays for the employer to refund."
                onSuccess={h => onSuccess(h, 'claim')}
                disabled={!!claimReason}
                disabledReason={claimReason} />
            </div>
          )}

          {actionStatus && <p className="text-xs" style={{ color: 'var(--success)' }}>{actionStatus}</p>}
        </section>
      </NetworkGuard>

      {/* Assigned shifts */}
      <section className="rounded-3xl p-5 space-y-3" style={glass}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Assigned shifts (this browser)</h2>
          <div className="flex gap-2">
            <input inputMode="numeric" value={manualId}
              onChange={e => setManualId(e.target.value.replace(/[^0-9]/g,''))}
              placeholder="ID" className="w-16 rounded-xl px-2 py-1.5 text-xs outline-none tabular-nums"
              style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
            <button onClick={() => { const n=parseInt(manualId,10); if(!isNaN(n)&&n>0){addAssignedShift(n);setManualId('');refresh()} }}
              className="flex size-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'var(--accent)' }}>
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        {myShifts.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>No shifts tracked here. Enter a shift ID above to add one.</p>
        ) : (
          <div className="space-y-2">
            {myShifts.map(id => (
              <ShiftRow key={id} id={id} onSelect={sid => navigate(`/shift/${sid}`)} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
