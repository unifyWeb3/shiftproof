import { useState } from 'react'
import { ShieldCheck, Briefcase, HardHat } from 'lucide-react'
import { useReadContract, useAccount } from 'wagmi'
import { ABI, CONTRACT_ADDRESS, CHAIN_ID, CHAIN_NAME, explorerAddr } from '../lib/contract'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'
import { fmtUsdc, fmtAddr } from '../lib/format'
import { usePath } from '../lib/router'

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

export default function Home() {
  const [, navigate] = usePath()
  const [shiftIdInput, setShiftIdInput] = useState('')
  const { address, isConnected } = useAccount()

  const { data: nextId } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'nextShiftId',
    chainId: CHAIN_ID,
    query: { enabled: hasContract, refetchInterval: 12000 },
  }) as { data: bigint | undefined }

  const { data: totalEscrow } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'totalEscrow',
    chainId: CHAIN_ID,
    query: { enabled: hasContract, refetchInterval: 12000 },
  }) as { data: bigint | undefined }

  const shiftsCreated = nextId !== undefined ? Number(nextId) - 1 : undefined

  const goToShift = () => {
    const n = parseInt(shiftIdInput, 10)
    if (!isNaN(n) && n > 0) navigate(`/shift/${n}`)
  }

  const steps = [
    { n: '1', title: 'Employer creates shift', body: 'Set hourly rate (USDC), assign a worker address, pick a max duration. USDC escrow is locked onchain.' },
    { n: '2', title: 'Worker clocks in / out', body: 'The worker calls clock-in when the shift starts, clock-out when it ends. Timestamps are recorded onchain.' },
    { n: '3', title: 'Employer attests hours', body: 'After clock-out, the employer attests the seconds to pay for. Attestation sets the owed amount.' },
    { n: '4', title: 'Worker claims pay', body: 'Once attested, the worker claims their owed USDC. Unused escrow is returned separately by refundUnused.' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-3xl p-6 text-center" style={glass}>
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl" style={{ background: 'var(--accent)' }}>
          <ShieldCheck className="size-7 text-white" />
        </div>
        <h1 className="display text-3xl font-bold" style={{ color: 'var(--ink)' }}>ShiftProof</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>
          On-chain shift escrow and attestation on {ACTIVE_NETWORK.label}.
          <br />USDC held until work is verified and claimed.
        </p>

        <div className="mt-5 flex items-center justify-center gap-6">
          <div>
            <p className="display text-2xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {shiftsCreated === undefined ? '...' : shiftsCreated.toLocaleString()}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Shifts created</p>
          </div>
          <div className="w-px h-8 rounded" style={{ background: 'var(--border)' }} />
          <div>
            <p className="display text-2xl font-bold tabular-nums" style={{ color: 'var(--ink)' }}>
              {totalEscrow === undefined ? '...' : fmtUsdc(totalEscrow)}
            </p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>USDC in escrow</p>
          </div>
        </div>

        {hasContract ? (
          <a href={explorerAddr(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer"
            className="mt-3 inline-block text-xs" style={{ color: 'var(--subtle)' }}>
            {CHAIN_NAME} · chain {CHAIN_ID}{ACTIVE_NETWORK.isTestnet ? ' · testnet' : ''}
          </a>
        ) : (
          <p className="mt-3 text-xs" style={{ color: 'var(--subtle)' }}>
            {CHAIN_NAME} · chain {CHAIN_ID} · not deployed on this network
          </p>
        )}
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Employer', sub: 'Create & manage shifts', icon: Briefcase, path: '/employer' },
          { label: 'Worker',   sub: 'Clock in, claim pay',   icon: HardHat,   path: '/worker' },
        ].map(({ label, sub, icon: Icon, path }) => (
          <button key={path} onClick={() => navigate(path)}
            className="rounded-2xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={glass}>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl" style={{ background: 'rgba(18,45,69,0.08)' }}>
              <Icon className="size-5" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</p>
          </button>
        ))}
      </div>

      {/* Wallet guide */}
      {isConnected && address ? (
        <section className="rounded-3xl p-4 space-y-2" style={glass}>
          <p className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Connected wallet</p>
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-xs" style={{ color: 'var(--muted)' }}>{fmtAddr(address)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: ACTIVE_NETWORK.isTestnet ? 'rgba(18,45,69,0.08)' : 'rgba(26,128,71,0.1)', color: 'var(--ink)' }}>
              {ACTIVE_NETWORK.label}
            </span>
          </div>
          <div className="pt-1 space-y-1 text-xs" style={{ color: 'var(--muted)' }}>
            <p><span className="font-semibold" style={{ color: 'var(--ink)' }}>As employer:</span> go to Employer to create and manage shifts.</p>
            <p><span className="font-semibold" style={{ color: 'var(--ink)' }}>As worker:</span> go to Worker and enter the shift ID your employer gave you.</p>
            <p><span className="font-semibold" style={{ color: 'var(--ink)' }}>To verify:</span> enter any shift ID in the lookup below.</p>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl px-4 py-3 text-center" style={glass}>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Connect wallet to create or manage shifts. Read-only lookup is always available below.
          </p>
        </section>
      )}

      {/* Verify a shift */}
      <section className="rounded-3xl p-5 space-y-3" style={glass}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Verify a shift</h2>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          Enter any shift ID to view its on-chain record. No wallet required.
        </p>
        <div className="flex gap-2">
          <input inputMode="numeric" value={shiftIdInput}
            onChange={e => setShiftIdInput(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyDown={e => e.key === 'Enter' && goToShift()}
            placeholder="Shift ID"
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none tabular-nums"
            style={{ border: '1px solid var(--border)', background: 'var(--surface-strong)', color: 'var(--ink)' }} />
          <button onClick={goToShift} disabled={!shiftIdInput}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: 'var(--accent)' }}>
            View
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="rounded-3xl p-5 space-y-4" style={glass}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>How it works</h2>
        {steps.map(s => (
          <div key={s.n} className="flex gap-3">
            <div className="shrink-0 flex size-6 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'var(--accent)' }}>{s.n}</div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{s.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{s.body}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
