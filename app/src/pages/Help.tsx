import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { CONTRACT_ADDRESS, CHAIN_ID, DEPLOYMENT_TX, explorerAddr, explorerTx, CHAIN_NAME } from '../lib/contract'
import { fmtAddr } from '../lib/format'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

const SOURCIFY_URL = `https://repo.sourcify.dev/${ACTIVE_NETWORK.chainId}/${CONTRACT_ADDRESS}`

const FAQS = [
  {
    q: 'What wallet should I use?',
    a: "Any injected EVM wallet works — MetaMask, Rabby, etc. ShiftProof uses your browser's injected connector. No WalletConnect project ID or QR codes are required.",
  },
  {
    q: 'Which network should I be on?',
    a: `${ACTIVE_NETWORK.label} (chain ID ${CHAIN_ID}). Add it in your wallet: RPC ${ACTIVE_NETWORK.rpcUrl}, chain ID ${CHAIN_ID}, currency symbol USDC (18 decimals for gas), explorer ${ACTIVE_NETWORK.explorerUrl}. The app will show a banner and a switch button if you are on the wrong chain.`,
  },
  {
    q: ACTIVE_NETWORK.isTestnet ? 'How do I get testnet USDC?' : 'How do I get USDC?',
    a: ACTIVE_NETWORK.isTestnet
      ? `Use the "Get test USDC" button in the Arc Studio sidebar. It will drip ${ACTIVE_NETWORK.label} USDC to your connected wallet for free. Testnet USDC has no real-world value.`
      : 'Acquire USDC on Arc and keep enough for gas. This build targets Arc mainnet and the ShiftProof contract is deployed here. Mainnet USDC has real value; the demo is not audited, so use only small amounts you can afford to lose.',
  },
  {
    q: 'Why does creating a shift need two transactions?',
    a: 'First you approve the exact USDC escrow amount to the ShiftProof contract. Then you call createShift, which pulls the approved USDC into escrow. The approval is exact — never unlimited.',
  },
  {
    q: 'What is "attesting" a shift?',
    a: 'After the worker clocks out, the employer calls attest with the number of seconds to pay for. This can be fewer than the actual clocked seconds — for example if some work was not accepted. The owed field is set from the attested seconds. Attestation is employer trust, not cryptographic verification: the employer sees timestamps onchain but there is no mechanism to prove the worker actually worked.',
  },
  {
    q: 'Who gets the unused escrow?',
    a: 'Unused escrow is returned to the employer by calling refundUnused. This is a separate, permissionless call — anyone can trigger it, but the funds always go to the employer address. Claiming does NOT automatically return unused escrow.',
  },
  {
    q: 'Can I cancel a shift?',
    a: 'The employer can cancel a shift ONLY while it is in Funded status (before the worker clocks in). Cancelling returns the full escrow to the employer. Once the worker has clocked in (status becomes Active), cancel is no longer available.',
  },
  {
    q: 'What fees does ShiftProof charge?',
    a: 'None. There is no protocol fee, no admin cut, and no token. You pay only Arc network gas (denominated in USDC on Arc, typically a tiny amount). The contract has no owner, admin, pause mechanism, or upgrade mechanism.',
  },
  {
    q: 'Is there a dispute mechanism?',
    a: 'No. The employer attests the hours, and that is the authoritative record. There is no arbitration, no escrow agent, and no dispute path onchain. Any disputes must be resolved off-chain before the employer attests. This is by design for the V1 demo.',
  },
  {
    q: 'What data is stored onchain?',
    a: 'Shift struct fields: employer and worker addresses, timestamps, hourly rate, max/attested seconds, escrow, owed, status. No names, emails, phone numbers, locations, tax IDs, or documents are stored onchain or in this app.',
  },
  {
    q: 'Can I reopen a settled or cancelled shift?',
    a: 'No. Settled and Cancelled are terminal states. They cannot be changed.',
  },
  {
    q: 'Is this on mainnet?',
    a: ACTIVE_NETWORK.isTestnet
      ? `No. ShiftProof V1 is deployed on ${ACTIVE_NETWORK.label} only. Testnet funds have no real-world value. A mainnet deployment would require a separate deploy and is not part of this demo.`
      : `Yes. This build targets Arc mainnet and the ShiftProof contract is deployed at ${CONTRACT_ADDRESS}. Mainnet USDC has real value. The contract is source-verified on Sourcify, but it was compiled with optimizer disabled and has not been audited. Do not use it with real workers.`,
  },
  {
    q: 'Why does localStorage matter?',
    a: "localStorage is a convenience cache so this browser remembers which shifts you created or were assigned to. It is NOT a source of truth — clearing it does not affect the contract or your funds. The shift's public receipt is always recoverable from the shift ID alone.",
  },
]

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-3 text-left gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{q}</span>
        {open ? <ChevronUp className="size-4 shrink-0" style={{ color: 'var(--muted)' }} />
               : <ChevronDown className="size-4 shrink-0" style={{ color: 'var(--muted)' }} />}
      </button>
      {open && <p className="pb-3 text-sm" style={{ color: 'var(--muted)' }}>{a}</p>}
    </div>
  )
}

export default function Help() {
  const contractRows: { label: string; value: string; link?: string; mono?: boolean }[] = hasContract
    ? [
        { label: 'Address', value: fmtAddr(CONTRACT_ADDRESS), link: explorerAddr(CONTRACT_ADDRESS) },
        { label: 'Full address', value: CONTRACT_ADDRESS, mono: true },
        { label: 'Network', value: `${CHAIN_NAME} (chain ${CHAIN_ID})` },
        ...(DEPLOYMENT_TX
          ? [{ label: 'Deploy tx', value: fmtAddr(DEPLOYMENT_TX), link: explorerTx(DEPLOYMENT_TX) }]
          : []),
      ]
    : [
        { label: 'Network', value: `${CHAIN_NAME} (chain ${CHAIN_ID})` },
        { label: 'Status', value: 'Not deployed on this network' },
      ]

  return (
    <div className="space-y-5">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Help</h1>

      {/* Contract info */}
      <section className="rounded-3xl p-5 space-y-3" style={glass}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Contract details</h2>
        <div className="space-y-2">
          {contractRows.map(r => (
            <div key={r.label} className="flex items-center justify-between gap-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{r.label}</span>
              {r.link ? (
                <a href={r.link} target="_blank" rel="noreferrer"
                  className={`text-xs flex items-center gap-0.5 underline ${r.mono ? 'mono' : ''}`}
                  style={{ color: 'var(--accent-hover)' }}>
                  {r.value} <ExternalLink className="size-2.5" />
                </a>
              ) : (
                <span className={`text-xs font-medium break-all text-right ${r.mono ? 'mono' : ''}`} style={{ color: 'var(--ink)' }}>
                  {r.value}
                </span>
              )}
            </div>
          ))}
        </div>
        {hasContract && (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>
            {ACTIVE_NETWORK.isTestnet
              ? 'Source is not verified on the explorer. The ABI is embedded from the compiled artifact.'
              : <>Source is verified on Sourcify (exact match).{' '}
                  <a href={SOURCIFY_URL} target="_blank" rel="noreferrer"
                    className="underline" style={{ color: 'var(--accent-hover)' }}>View verification</a>.
                </>}
          </p>
        )}
      </section>

      {/* Status flow */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Status flow</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left py-1 pr-3" style={{ color: 'var(--muted)' }}>Status</th>
                <th className="text-left py-1" style={{ color: 'var(--muted)' }}>Who can act / what</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Funded',               'Worker: clockIn | Employer: cancel, attest'],
                ['Active',               'Worker: clockOut | Employer: attest'],
                ['Awaiting Attestation', 'Employer: attest'],
                ['Attested',             'Worker: claim | Anyone: refundUnused (to employer)'],
                ['Claimed',              'Anyone: refundUnused if escrow > 0 (to employer)'],
                ['Settled',              'Terminal — no further actions'],
                ['Cancelled',            'Terminal — no further actions'],
              ].map(([st, act]) => (
                <tr key={st} style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-1.5 pr-3 font-medium" style={{ color: 'var(--ink)' }}>{st}</td>
                  <td className="py-1.5" style={{ color: 'var(--muted)' }}>{act}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs" style={{ color: 'var(--subtle)' }}>
          Cancel is only allowed in Funded status. RefundUnused is permissionless and always pays the employer.
          Unused escrow is NOT returned automatically by claim.
        </p>
      </section>

      {/* Disclosures */}
      <section className="rounded-3xl p-5 space-y-2"
        style={{ ...glass, border: '1px solid var(--danger)', background: 'rgba(186,43,76,0.04)' }}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>Risk disclosures</h2>
        <ul className="text-xs space-y-1.5 list-disc pl-4" style={{ color: 'var(--ink-2)' }}>
          <li>{ACTIVE_NETWORK.isTestnet
            ? 'Testnet only. All tokens have no real-world value.'
            : 'Arc mainnet. Real USDC is at risk. The contract is source-verified but not audited; use only small amounts you can afford to lose.'}</li>
          <li>Attestation is employer trust — there is no trustless verification of hours worked.</li>
          <li>No dispute mechanism. Disagreements must be resolved off-chain.</li>
          <li>No fees beyond Arc network gas. No admin, no pause, no upgrade.</li>
          <li>No PII is stored onchain or in this app. Do not enter names, emails, or personal data.</li>
          <li>LocalStorage is a cache only. Always use the shift ID to recover records.</li>
          <li>{ACTIVE_NETWORK.isTestnet
            ? 'Source verification is unavailable. Verify the ABI against the artifact yourself.'
            : 'Source is verified on Sourcify. Explorer verification may still be pending.'}</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="rounded-3xl px-5 py-4" style={glass}>
        <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--ink)' }}>FAQ</h2>
        {FAQS.map(f => <FAQ key={f.q} {...f} />)}
      </section>
    </div>
  )
}
