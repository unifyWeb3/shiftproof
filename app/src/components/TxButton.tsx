/**
 * Simulate → confirm card → sign → wait → report.
 * Shows a human-readable confirmation step before touching the wallet.
 */
import { useState } from 'react'
import { usePublicClient, useWalletClient, useAccount } from 'wagmi'
import { Loader2, X } from 'lucide-react'
import { CHAIN_ID, CONTRACT_ADDRESS, CHAIN_NAME } from '../lib/contract'
import { decodeContractError, fmtUsdc, fmtAddr } from '../lib/format'

export interface TxArgs {
  address: `0x${string}`
  abi: readonly unknown[]
  functionName: string
  args?: readonly unknown[]
}

interface Props {
  txArgs: TxArgs | null
  label: string
  loadingLabel?: string
  /** Human-readable summary of what happens (shown in the confirm card). */
  detail?: string
  /** USDC amount involved, shown in the confirm card. */
  amount?: bigint
  /** Shift ID, shown in the confirm card. */
  shiftId?: number
  onSuccess?: (hash: `0x${string}`) => void
  onError?: (msg: string) => void
  disabled?: boolean
  variant?: 'primary' | 'danger'
}

type Phase = 'idle' | 'confirm' | 'simulating' | 'signing' | 'confirming'

export default function TxButton({
  txArgs, label, loadingLabel, detail, amount, shiftId,
  onSuccess, onError, disabled, variant = 'primary',
}: Props) {
  const { isConnected, chainId } = useAccount()
  const publicClient = usePublicClient({ chainId: CHAIN_ID })
  const { data: walletClient } = useWalletClient({ chainId: CHAIN_ID })
  const [phase, setPhase] = useState<Phase>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  const isWrongChain = isConnected && chainId !== CHAIN_ID
  const busy = phase !== 'idle' && phase !== 'confirm'

  const accentColor = variant === 'danger' ? 'var(--danger)' : 'var(--accent)'

  const isDisabled = disabled || busy || !isConnected || isWrongChain || !txArgs

  const handleOpen = () => {
    setErrMsg(null)
    setPhase('confirm')
  }

  const handleCancel = () => {
    setPhase('idle')
    setErrMsg(null)
  }

  const handleConfirm = async () => {
    if (!txArgs || !publicClient || !walletClient) return
    setErrMsg(null)
    try {
      setPhase('simulating')
      await publicClient.simulateContract({
        address: txArgs.address,
        abi: txArgs.abi as Parameters<typeof publicClient.simulateContract>[0]['abi'],
        functionName: txArgs.functionName,
        args: txArgs.args,
        account: walletClient.account,
      })

      setPhase('signing')
      const hash = await walletClient.writeContract({
        address: txArgs.address,
        abi: txArgs.abi as Parameters<typeof walletClient.writeContract>[0]['abi'],
        functionName: txArgs.functionName,
        args: txArgs.args,
        chain: null,
      })

      setPhase('confirming')
      await publicClient.waitForTransactionReceipt({ hash })
      setPhase('idle')
      onSuccess?.(hash)
    } catch (e: unknown) {
      setPhase('idle')
      const msg = decodeContractError(e)
      setErrMsg(msg)
      onError?.(msg)
    }
  }

  const statusLabel = () => {
    if (!isConnected) return 'Connect wallet to continue'
    if (isWrongChain) return `Wrong network — switch to ${CHAIN_NAME}`
    if (phase === 'simulating') return 'Checking transaction...'
    if (phase === 'signing') return loadingLabel ?? 'Confirm in wallet...'
    if (phase === 'confirming') return 'Waiting for confirmation...'
    return label
  }

  return (
    <div>
      {/* Confirm card overlay */}
      {phase === 'confirm' && (
        <div className="mb-3 rounded-2xl p-4 space-y-3"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-strong)' }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>Confirm action</span>
            <button onClick={handleCancel} className="flex size-6 items-center justify-center rounded-full"
              style={{ background: 'var(--border)', color: 'var(--muted)' }}>
              <X className="size-3" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            <Row label="Action" value={label} />
            {shiftId !== undefined && <Row label="Shift ID" value={`#${shiftId}`} />}
            {amount !== undefined && <Row label="Amount" value={`${fmtUsdc(amount, 2)} USDC`} />}
            {detail && <Row label="Effect" value={detail} />}
            <Row label="Network" value={CHAIN_NAME} />
            <Row label="Contract" value={fmtAddr(CONTRACT_ADDRESS)} mono />
          </div>
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            Simulation will run before your wallet opens. If it fails, no transaction is sent.
          </p>
          <button
            onClick={() => { void handleConfirm() }}
            className="w-full rounded-xl py-2.5 text-sm font-semibold text-white"
            style={{ background: accentColor }}>
            Confirm and sign
          </button>
        </div>
      )}

      <button
        onClick={handleOpen}
        disabled={isDisabled}
        className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: accentColor }}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {statusLabel()}
      </button>

      {errMsg && (
        <p className="mt-2 text-xs text-center" style={{ color: 'var(--danger)' }}>{errMsg}</p>
      )}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span className={`font-medium tabular-nums ${mono ? 'mono' : ''}`} style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}


