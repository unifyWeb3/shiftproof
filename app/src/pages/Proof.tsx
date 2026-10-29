/**
 * /proof — Submission / judge page.
 * Shows the deployment facts, verification status, and honest placeholders.
 * No write operations. No wallet required.
 */
import { ExternalLink } from 'lucide-react'
import {
  CONTRACT_ADDRESS, CHAIN_ID, CHAIN_NAME, DEPLOYMENT_TX,
  USDC_ADDRESS, DEPLOYMENT_BLOCK, EXPLORER_BASE,
  explorerAddr, explorerTx,
} from '../lib/contract'
import { fmtAddr } from '../lib/format'

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

function InfoRow({ label, value, link, mono }: { label: string; value: string; link?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer"
          className={`text-xs font-medium flex items-center gap-0.5 underline text-right ${mono ? 'mono' : ''}`}
          style={{ color: 'var(--accent-hover)' }}>
          {value}<ExternalLink className="size-2.5 shrink-0" />
        </a>
      ) : (
        <span className={`text-xs font-medium text-right break-all ${mono ? 'mono' : ''}`} style={{ color: 'var(--ink)' }}>
          {value}
        </span>
      )}
    </div>
  )
}

function StatusItem({ label, ok, note }: { label: string; ok: boolean; note?: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="mt-0.5 shrink-0 text-xs font-bold" style={{ color: ok ? 'var(--success)' : 'var(--danger)' }}>
        {ok ? 'PASS' : 'UNVERIFIED'}
      </span>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{label}</p>
        {note && <p className="text-xs" style={{ color: 'var(--muted)' }}>{note}</p>}
      </div>
    </div>
  )
}

export default function Proof() {
  return (
    <div className="space-y-5">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Proof of work</h1>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        Submission page for the ShiftProof V1 demonstration. Shows deployment facts, verification status, and links for judges.
      </p>

      {/* Deployment */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Deployment</h2>
        <InfoRow label="App URL (Arc Studio)" value="(this page — hosted via Arc Studio preview)" />
        <InfoRow label="Network" value={`${CHAIN_NAME} (chain ${CHAIN_ID})`} />
        <InfoRow label="Contract" value={CONTRACT_ADDRESS} link={explorerAddr(CONTRACT_ADDRESS)} mono />
        <InfoRow label="USDC token" value={USDC_ADDRESS} link={`${EXPLORER_BASE}/address/${USDC_ADDRESS}`} mono />
        <InfoRow label="Deploy tx" value={fmtAddr(DEPLOYMENT_TX)} link={explorerTx(DEPLOYMENT_TX)} mono />
        <InfoRow label="Deployment block" value={DEPLOYMENT_BLOCK.toString()} />
        <InfoRow label="Explorer" value={EXPLORER_BASE} link={EXPLORER_BASE} />
      </section>

      {/* Verification status */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Verification status</h2>
        <StatusItem label="Contract deployed to Arc Testnet" ok
          note={`Tx ${fmtAddr(DEPLOYMENT_TX)} at block ${DEPLOYMENT_BLOCK}`} />
        <StatusItem label="Source verified on explorer" ok={false}
          note="Source verification via the explorer API was unavailable at deploy time. The ABI is embedded in this app from the compiled artifact." />
        <StatusItem label="76/76 Foundry unit/fuzz/invariant tests pass" ok
          note="Confirmed locally with forge test. See contracts/test/ShiftProof.t.sol." />
        <StatusItem label="Fork-based E2E (3 flows, anvil + MockUSDC)" ok
          note="Arc Testnet USDC calls a precompile absent in vanilla anvil; E2E used MockUSDC on the fork. See TESTNET-E2E.md." />
        <StatusItem label="Live USDC E2E on Arc Testnet" ok={false}
          note="Not yet verified with real Arc Testnet USDC and two live wallets. Fork tests pass; live-USDC path is unverified." />
        <StatusItem label="ABI match between artifact and deployed bytecode" ok={false}
          note="Explorer does not show verified source. ABI is taken directly from forge build artifact." />
      </section>

      {/* Links */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Links</h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--muted)' }}>Public repo</span>
            <span style={{ color: 'var(--subtle)' }}>(link to be added)</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--muted)' }}>Demo video</span>
            <span style={{ color: 'var(--subtle)' }}>(link to be added)</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--muted)' }}>Live hosted app</span>
            <span style={{ color: 'var(--subtle)' }}>(Arc Studio preview — deploy to share publicly)</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--muted)' }}>Architecture doc</span>
            <span style={{ color: 'var(--subtle)' }}>(see README.md and AGENTS.md in the repo)</span>
          </div>
        </div>
      </section>

      {/* ABI */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--ink)' }}>ABI</h2>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          The ABI is read at build time from{' '}
          <span className="mono">contracts/out/ShiftProof.sol/ShiftProof.json</span>.
          It matches the deployed bytecode subject to the source-verification caveat above.
          The contract address is committed in <span className="mono">deployments.json</span>.
        </p>
        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
          Key functions: <span className="mono">createShift</span>,{' '}
          <span className="mono">clockIn/clockOut</span>,{' '}
          <span className="mono">attest</span>,{' '}
          <span className="mono">claim</span>,{' '}
          <span className="mono">refundUnused</span>,{' '}
          <span className="mono">cancel</span>,{' '}
          <span className="mono">getShift</span>.
        </p>
      </section>

      {/* Caveats */}
      <section className="rounded-3xl p-5" style={{ ...glass, border: '1px solid #fde047', background: 'var(--warning-bg)' }}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: '#713f12' }}>Caveats</h2>
        <ul className="text-xs space-y-1.5 list-disc pl-4" style={{ color: '#92400e' }}>
          <li>This is Arc Testnet. Funds have no real-world value.</li>
          <li>Source verification is unavailable via the explorer API.</li>
          <li>Live-USDC E2E with two real wallets has not been run. Fork tests used MockUSDC.</li>
          <li>Fork test hashes are NOT testnet transaction hashes and are not listed here.</li>
          <li>No backend, no indexer, no admin, no upgrade mechanism.</li>
          <li>localStorage is a convenience cache only. Clearing it does not affect the contract.</li>
        </ul>
      </section>
    </div>
  )
}
