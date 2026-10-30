import { useState } from 'react'
import { useAccount, useReadContract, usePublicClient, useWalletClient } from 'wagmi'
import { erc20Abi, decodeEventLog } from 'viem'
import { Plus, RefreshCw } from 'lucide-react'
import {
  ABI, CONTRACT_ADDRESS, USDC_ADDRESS, CHAIN_ID,
  STATUS_LABELS, type ShiftTuple,
} from '../lib/contract'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'
import { fmtUsdc, fmtAddr, fmtSeconds, parseUsdcInput, decodeContractError } from '../lib/format'
import {
  addCreatedShift, getCreatedShifts,
  updateShiftTxRecord, getShiftTxRecord,
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
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getShift',
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
        {s && <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>{fmtUsdc(s.escrow)} USDC</span>}
        {s ? <StatusBadge status={s.status} size="sm" /> : <span className="text-xs" style={{ color: 'var(--subtle)' }}>loading…</span>}
      </div>
    </button>
  )
}

export default function Employer() {
  const { address, isConnected } = useAccount()
  const wrongChain = useWrongChain()
  const [, navigate] = usePath()
  const publicClient = usePublicClient({ chainId: CHAIN_ID })
  const { data: walletClient } = useWalletClient({ chainId: CHAIN_ID })

  // Create-shift form
  const [workerAddr, setWorkerAddr] = useState('')
  const [rateStr, setRateStr]       = useState('')
  const [hoursStr, setHoursStr]     = useState('')
  const [createStatus, setCreateStatus] = useState<string | null>(null)
  const [createErr, setCreateErr]   = useState<string | null>(null)

  // Attest/cancel/refund panel
  const [actionId, setActionId] = useState<number | null>(null)
  const [attestSecsStr, setAttestSecsStr] = useState('')
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // Local created-shift IDs
  const [refreshKey, setRefreshKey] = useState(0)
  void refreshKey
  const myShifts = getCreatedShifts()
  const refresh = () => setRefreshKey(k => k + 1)

  // Manual add
  const [manualId, setManualId] = useState('')

  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS, abi: erc20Abi, functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address, refetchInterval: 8000 },
  }) as { data: bigint | undefined }

  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS, abi: erc20Abi, functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address && hasContract, refetchInterval: 8000 },
  }) as { data: bigint | undefined; refetch: () => void }

  const selectedShift = useShift(actionId)
  const shiftData = selectedShift.data as ShiftTuple | undefined

  // Computed
  const rateRaw   = rateStr   ? parseUsdcInput(rateStr)  : 0n
  const maxSecs   = hoursStr  ? Math.round(parseFloat(hoursStr) * 3600) : 0
  const escrowNeeded = maxSecs > 0 && rateRaw > 0n
    ? (rateRaw * BigInt(maxSecs)) / BigInt(3600)
    : 0n
  const workerAddrValid = /^0x[0-9a-fA-F]{40}$/.test(workerAddr)
  const createReady = workerAddrValid && rateRaw > 0n && maxSecs > 0

  const needsApproval = createReady && usdcAllowance !== undefined && usdcAllowance < escrowNeeded

  const approveTxArgs = createReady && needsApproval ? {
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: 'approve',
    args: [CONTRACT_ADDRESS, escrowNeeded],
  } : null

  // createShift is handled manually (need to decode ShiftCreated event)
  // we keep TxButton for approve; use direct async for create
  const [creating, setCreating] = useState(false)
  const handleCreate = async () => {
    if (!hasContract) { setCreateErr('ShiftProof is not deployed on this network.'); return }
    if (!publicClient || !walletClient || !createReady || needsApproval) return
    setCreateErr(null)
    setCreateStatus(null)
    setCreating(true)
    try {
      // simulate
      await publicClient.simulateContract({
        address: CONTRACT_ADDRESS,
        abi: ABI as Parameters<typeof publicClient.simulateContract>[0]['abi'],
        functionName: 'createShift',
        args: [workerAddr as `0x${string}`, rateRaw, maxSecs],
        account: walletClient.account,
      })
      // sign
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI as Parameters<typeof walletClient.writeContract>[0]['abi'],
        functionName: 'createShift',
        args: [workerAddr as `0x${string}`, rateRaw, maxSecs],
        chain: null,
      })
      // wait
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      // decode ShiftCreated event to get the real shift ID
      let newId: number | null = null
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: ABI,
            data: log.data,
            topics: log.topics,
            eventName: 'ShiftCreated',
          })
          if (decoded.eventName === 'ShiftCreated') {
            const args = decoded.args as unknown as { shiftId: bigint }
            newId = Number(args.shiftId)
            break
          }
        } catch { /* not this log */ }
      }
      if (newId !== null) {
        addCreatedShift(newId)
        updateShiftTxRecord(newId, { create: hash })
        setCreateStatus(`Shift #${newId} created! Tx: ${fmtAddr(hash)}`)
        navigate(`/shift/${newId}`)
      } else {
        setCreateStatus(`Created! Tx: ${fmtAddr(hash)} — add the shift ID manually.`)
      }
      refresh()
    } catch (e) {
      setCreateErr(decodeContractError(e))
    } finally {
      setCreating(false)
    }
  }

  // Attest
  const attestSecs = attestSecsStr ? parseInt(attestSecsStr, 10) : 0
  const attestTxArgs = actionId !== null && attestSecs >= 0 && shiftData && attestSecs <= shiftData.maxSeconds ? {
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'attest',
    args: [BigInt(actionId), attestSecs],
  } : null

  const cancelTxArgs = actionId !== null && shiftData?.status === 1 ? {
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'cancel', args: [BigInt(actionId)],
  } : null

  const refundAvailable = shiftData && (
    (shiftData.status === 4 && shiftData.escrow > shiftData.owed) ||
    (shiftData.status === 5 && shiftData.escrow > 0n)
  )
  const refundTxArgs = actionId !== null && refundAvailable ? {
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'refundUnused', args: [BigInt(actionId)],
  } : null

  const onActionSuccess = (hash: `0x${string}`, type: 'attest' | 'cancel' | 'refund') => {
    if (actionId !== null) updateShiftTxRecord(actionId, { [type]: hash })
    setActionStatus(`Done! Tx: ${fmtAddr(hash)}`)
    void selectedShift.refetch()
  }

  return (
    <div className="space-y-5">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Employer</h1>

      {/* Network guard banner — never hides content */}
      <NetworkGuard>
        {/* Balance */}
        {isConnected && (
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between" style={glass}>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Your USDC (ERC-20)</span>
            <span className="display text-lg font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {usdcBalance !== undefined ? fmtUsdc(usdcBalance) : '...'} USDC
            </span>
          </div>
        )}

        {/* Create Shift */}
        <section className="rounded-3xl p-5 space-y-4" style={glass}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Create shift</h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Worker address</label>
              <input value={workerAddr} onChange={e => setWorkerAddr(e.target.value.trim())}
                placeholder="0x..."
                className="w-full rounded-xl px-3 py-2.5 text-sm mono outline-none"
                style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
              {workerAddr && !workerAddrValid && (
                <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>Not a valid address</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Rate (USDC/hr)</label>
                <input inputMode="decimal" value={rateStr}
                  onChange={e => { const v = e.target.value.replace(/[^0-9.]/g,''); if (v===''||/^\d*\.?\d*$/.test(v)) setRateStr(v) }}
                  placeholder="10.00"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none tabular-nums"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--muted)' }}>Max hours</label>
                <input inputMode="decimal" value={hoursStr}
                  onChange={e => { const v = e.target.value.replace(/[^0-9.]/g,''); if (v===''||/^\d*\.?\d*$/.test(v)) setHoursStr(v) }}
                  placeholder="8"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none tabular-nums"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
              </div>
            </div>

            {createReady && (
              <div className="rounded-xl px-3 py-2 space-y-1" style={{ background: 'var(--surface-muted)' }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Max seconds</span>
                  <span className="tabular-nums font-medium" style={{ color: 'var(--ink)' }}>{maxSecs}s ({fmtSeconds(maxSecs)})</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted)' }}>Escrow to lock</span>
                  <span className="tabular-nums font-medium" style={{ color: 'var(--ink)' }}>{fmtUsdc(escrowNeeded)} USDC</span>
                </div>
                {needsApproval && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Step 1: approve exact USDC. Step 2: create shift.
                  </p>
                )}
              </div>
            )}
          </div>

          {needsApproval ? (
            <TxButton txArgs={approveTxArgs} label={`Allow ${fmtUsdc(escrowNeeded)} USDC`}
              loadingLabel="Approving..." amount={escrowNeeded}
              detail="Exact USDC approval to ShiftProof contract. Not unlimited."
              onSuccess={() => { refetchAllowance(); setCreateErr(null) }}
              onError={setCreateErr} disabled={!createReady || wrongChain} />
          ) : (
            <button
              onClick={() => { void handleCreate() }}
              disabled={!createReady || creating || wrongChain || !isConnected || !hasContract}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)' }}>
              {creating ? 'Creating...' : 'Create shift'}
            </button>
          )}

          {!hasContract ? (
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              ShiftProof is not deployed on this network.
            </p>
          ) : !isConnected ? (
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              Connect wallet to create a shift.
            </p>
          ) : wrongChain ? (
            <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>
              Wrong network — switch to {ACTIVE_NETWORK.label}.
            </p>
          ) : null}
          {createStatus && <p className="text-xs" style={{ color: 'var(--success)' }}>{createStatus}</p>}
          {createErr    && <p className="text-xs" style={{ color: 'var(--danger)' }}>{createErr}</p>}
        </section>

        {/* Attest / Cancel / Refund */}
        <section className="rounded-3xl p-5 space-y-4" style={glass}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Manage a shift</h2>

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
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Status</span>
                <StatusBadge status={shiftData.status} size="sm" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Worker</span>
                <span className="text-xs mono" style={{ color: 'var(--ink)' }}>{fmtAddr(shiftData.worker)}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Escrow</span>
                <span className="text-xs tabular-nums font-medium" style={{ color: 'var(--ink)' }}>{fmtUsdc(shiftData.escrow)} USDC</span>
              </div>
              {shiftData.owed > 0n && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>Owed</span>
                  <span className="text-xs tabular-nums font-medium" style={{ color: 'var(--success)' }}>{fmtUsdc(shiftData.owed)} USDC</span>
                </div>
              )}
            </div>
          )}

          {/* Attest — visible when shift loaded; disabled with reason when not allowed */}
          {shiftData && (() => {
            const isEmployer = address && shiftData.employer.toLowerCase() === address.toLowerCase()
            const statusOk = shiftData.status === 1 || shiftData.status === 2 || shiftData.status === 3
            const attestDisabledReason = !isConnected
              ? 'Connect wallet to attest.'
              : wrongChain ? `Wrong network — switch to ${ACTIVE_NETWORK.label}.`
              : !isEmployer ? `Only the employer (${fmtAddr(shiftData.employer)}) can attest.`
              : !statusOk ? `Shift status is ${STATUS_LABELS[shiftData.status]}; attest requires Funded, Active, or Awaiting Attestation.`
              : attestSecsStr && attestSecs > shiftData.maxSeconds ? `${attestSecs}s exceeds max ${shiftData.maxSeconds}s.`
              : undefined
            return (
              <div className="space-y-2">
                <label className="block text-xs" style={{ color: 'var(--muted)' }}>
                  Attest seconds (0 – {shiftData.maxSeconds})
                </label>
                <input inputMode="numeric" value={attestSecsStr}
                  onChange={e => setAttestSecsStr(e.target.value.replace(/[^0-9]/g,''))}
                  placeholder={`e.g. ${shiftData.maxSeconds}`}
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none tabular-nums"
                  style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
                {attestSecsStr && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Owed: {fmtUsdc((shiftData.hourlyRate * BigInt(attestSecs)) / BigInt(3600))} USDC for {fmtSeconds(attestSecs)}
                  </p>
                )}
                <TxButton txArgs={attestDisabledReason ? null : attestTxArgs}
                  label="Attest" loadingLabel="Attesting..."
                  shiftId={actionId ?? undefined}
                  amount={attestSecs > 0 ? (shiftData.hourlyRate * BigInt(attestSecs)) / BigInt(3600) : undefined}
                  detail="Sets the attested seconds and owed amount. The worker can then claim."
                  onSuccess={h => onActionSuccess(h, 'attest')}
                  disabled={!!attestDisabledReason || wrongChain}
                  disabledReason={attestDisabledReason} />
              </div>
            )
          })()}

          {/* Cancel — visible when shift loaded; disabled with reason */}
          {shiftData && (() => {
            const isEmployer = address && shiftData.employer.toLowerCase() === address.toLowerCase()
            const cancelDisabledReason = !isConnected
              ? 'Connect wallet to cancel.'
              : wrongChain ? `Wrong network — switch to ${ACTIVE_NETWORK.label}.`
              : !isEmployer ? `Only the employer (${fmtAddr(shiftData.employer)}) can cancel.`
              : shiftData.status !== 1 ? `Shift status is ${STATUS_LABELS[shiftData.status]}; cancel requires Funded.`
              : undefined
            return (
              <TxButton txArgs={cancelDisabledReason ? null : cancelTxArgs}
                label="Cancel shift" loadingLabel="Cancelling..."
                shiftId={actionId ?? undefined}
                detail="Returns full escrow to the employer. Only available in Funded status."
                variant="danger"
                onSuccess={h => onActionSuccess(h, 'cancel')}
                disabled={!!cancelDisabledReason || wrongChain}
                disabledReason={cancelDisabledReason} />
            )
          })()}

          {/* RefundUnused — permissionless; visible when shift loaded */}
          {shiftData && (() => {
            const refundAvailable =
              (shiftData.status === 4 && shiftData.escrow > shiftData.owed) ||
              (shiftData.status === 5 && shiftData.escrow > 0n)
            const refundDisabledReason = !isConnected
              ? 'Connect wallet to refund.'
              : wrongChain
              ? `Wrong network — switch to ${ACTIVE_NETWORK.label}.`
              : !refundAvailable
              ? `No unused escrow to refund at this stage (status: ${STATUS_LABELS[shiftData.status]}).`
              : undefined
            const refundAmt = refundAvailable
              ? (shiftData.status === 4 ? shiftData.escrow - shiftData.owed : shiftData.escrow)
              : undefined
            return (
              <div className="space-y-1">
                <TxButton txArgs={refundDisabledReason ? null : refundTxArgs}
                  label="Refund unused USDC" loadingLabel="Refunding..."
                  shiftId={actionId ?? undefined}
                  amount={refundAmt}
                  detail="Permissionless. Returns unused escrow to the employer."
                  onSuccess={h => onActionSuccess(h, 'refund')}
                  disabled={!!refundDisabledReason || wrongChain}
                  disabledReason={refundDisabledReason} />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Refund always goes to the employer address, regardless of who calls this.
                </p>
              </div>
            )
          })()}

          {actionStatus && <p className="text-xs" style={{ color: 'var(--success)' }}>{actionStatus}</p>}
        </section>
      </NetworkGuard>

      {/* Created shifts list */}
      <section className="rounded-3xl p-5 space-y-3" style={glass}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Created shifts (this browser)</h2>
          <div className="flex gap-2">
            <input inputMode="numeric" value={manualId}
              onChange={e => setManualId(e.target.value.replace(/[^0-9]/g,''))}
              placeholder="ID" className="w-16 rounded-xl px-2 py-1.5 text-xs outline-none tabular-nums"
              style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
            <button onClick={() => { const n=parseInt(manualId,10); if(!isNaN(n)&&n>0){addCreatedShift(n);setManualId('');refresh()} }}
              className="flex size-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'var(--accent)' }}>
              <Plus className="size-4" />
            </button>
          </div>
        </div>
        {myShifts.length === 0 ? (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            No shifts yet. Create one above, or add a shift ID to track it here.
          </p>
        ) : (
          <div className="space-y-2">
            {myShifts.map(id => {
              const rec = getShiftTxRecord(id)
              return <ShiftRow key={id} id={id} onSelect={sid => { navigate(`/shift/${sid}`) ; void rec }} />
            })}
          </div>
        )}
      </section>
    </div>
  )
}
