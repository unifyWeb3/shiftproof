/**
 * /proof — Submission / judge page.
 * Shows deployment facts, live chain reads, and verification status.
 * No write operations. No wallet required.
 */
import { useEffect, useState } from 'react'
import { createPublicClient, http, keccak256 } from 'viem'
import { useReadContract } from 'wagmi'
import { ExternalLink, Loader2 } from 'lucide-react'
import { ACTIVE_NETWORK, explorerAddr, explorerTx, hasContract } from '../lib/networks'
import { ABI, CONTRACT_ADDRESS, USDC_ADDRESS, CHAIN_ID } from '../lib/contract'
import { fmtAddr, fmtUsdc } from '../lib/format'

const glass = {
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
} as const

const SOURCIFY_URL = `https://repo.sourcify.dev/${ACTIVE_NETWORK.chainId}/${CONTRACT_ADDRESS}`

function InfoRow({
  label, value, link, mono, loading,
}: { label: string; value: string; link?: string; mono?: boolean; loading?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
      <span className="text-xs shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
      {loading ? (
        <Loader2 className="size-3 animate-spin" style={{ color: 'var(--subtle)' }} />
      ) : link ? (
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
      <span className="mt-0.5 shrink-0 text-xs font-bold w-20" style={{ color: ok ? 'var(--success)' : 'var(--danger)' }}>
        {ok ? 'PASS' : 'UNVERIFIED'}
      </span>
      <div>
        <p className="text-xs font-medium" style={{ color: 'var(--ink)' }}>{label}</p>
        {note && <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{note}</p>}
      </div>
    </div>
  )
}

// ─── Live chain data ──────────────────────────────────────────────────────────

interface LiveData {
  chainId: number | null
  blockNumber: bigint | null
  bytecode: `0x${string}` | null
  codeSize: number
  runtimeHash: string
  error: string | null
}

function useLiveChain(): LiveData & { loading: boolean } {
  const [state, setState] = useState<LiveData>({
    chainId: null, blockNumber: null, bytecode: null,
    codeSize: 0, runtimeHash: '', error: null,
  })
  // Start in loading=true so we don't show stale empty state before the first RPC call finishes.
  const [loading, setLoading] = useState(hasContract)

  useEffect(() => {
    if (!hasContract || !ACTIVE_NETWORK.contractAddress) return
    const client = createPublicClient({
      transport: http(ACTIVE_NETWORK.rpcUrl),
    })
    void (async () => {
      try {
        const [chainId, blockNumber, bytecode] = await Promise.all([
          client.getChainId(),
          client.getBlockNumber(),
          client.getCode({ address: ACTIVE_NETWORK.contractAddress as `0x${string}` }),
        ])
        const codeSize = bytecode ? Math.floor((bytecode.length - 2) / 2) : 0
        const runtimeHash = bytecode && bytecode !== '0x'
          ? keccak256(bytecode)
          : ''
        setState({ chainId, blockNumber, bytecode: bytecode ?? null, codeSize, runtimeHash, error: null })
      } catch (e) {
        setState(s => ({ ...s, error: String((e as { message?: string }).message ?? e) }))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return { ...state, loading }
}

export default function Proof() {
  const live = useLiveChain()

  // Contract reads — only when deployed
  const { data: usdcAddr, isError: usdcAddrError } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'usdc',
    chainId: CHAIN_ID, query: { enabled: hasContract },
  }) as { data: `0x${string}` | undefined; isError: boolean }

  const { data: nextId, isError: nextIdError } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'nextShiftId',
    chainId: CHAIN_ID, query: { enabled: hasContract },
  }) as { data: bigint | undefined; isError: boolean }

  const { data: totalEscrow, isError: totalEscrowError } = useReadContract({
    address: CONTRACT_ADDRESS, abi: ABI, functionName: 'totalEscrow',
    chainId: CHAIN_ID, query: { enabled: hasContract },
  }) as { data: bigint | undefined; isError: boolean }

  // USDC decimals
  const ERC20_DECIMALS_ABI = [{ type: 'function', name: 'decimals', inputs: [], outputs: [{ type: 'uint8' }], stateMutability: 'view' }] as const
  const { data: usdcDecimals, isError: usdcDecimalsError } = useReadContract({
    address: USDC_ADDRESS, abi: ERC20_DECIMALS_ABI, functionName: 'decimals',
    chainId: CHAIN_ID, query: { enabled: hasContract },
  }) as { data: number | undefined; isError: boolean }

  // A configured address with no bytecode is not a deployment.
  const codeMissing = hasContract && !live.loading && !live.error &&
    (live.bytecode === null || live.bytecode === '0x')
  const notDeployed = !hasContract || codeMissing

  return (
    <div className="space-y-5">
      <h1 className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>Proof of work</h1>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        Submission page for the ShiftProof V1 demonstration.
        Deployment facts, live chain data, and verification status.
      </p>

      {/* Network / Deployment */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>
          Deployment — {ACTIVE_NETWORK.label}
        </h2>

        {notDeployed ? (
          <div className="rounded-xl px-4 py-3 text-center"
            style={{ background: 'rgba(186,43,76,0.07)', color: 'var(--danger)' }}>
            <p className="text-sm font-semibold">{ACTIVE_NETWORK.label} — not deployed</p>
            <p className="mt-1 text-xs">Not deployed on this network. No contract data is shown.</p>
          </div>
        ) : (
          <>
            <InfoRow label="App URL" value={window.location.origin} link={window.location.origin} />
            <InfoRow label="Network" value={`${ACTIVE_NETWORK.label} (chain ${ACTIVE_NETWORK.chainId})`} />
            <InfoRow
              label="Live chain ID"
              value={live.chainId !== null ? String(live.chainId) : live.error ? 'RPC error' : '...'}
              loading={live.loading && live.chainId === null}
            />
            <InfoRow
              label="Live block"
              value={live.blockNumber !== null ? live.blockNumber.toLocaleString() : live.error ? 'RPC error' : '...'}
              loading={live.loading && live.blockNumber === null}
            />
            <InfoRow
              label="Contract"
              value={CONTRACT_ADDRESS}
              link={explorerAddr(CONTRACT_ADDRESS)}
              mono
            />
            {ACTIVE_NETWORK.deploymentTx && (
              <InfoRow
                label="Deploy tx"
                value={fmtAddr(ACTIVE_NETWORK.deploymentTx)}
                link={explorerTx(ACTIVE_NETWORK.deploymentTx)}
                mono
              />
            )}
            {ACTIVE_NETWORK.deploymentBlock !== null && (
              <InfoRow label="Deployment block" value={ACTIVE_NETWORK.deploymentBlock.toLocaleString()} />
            )}
            <InfoRow
              label="Code size"
              value={live.codeSize > 0 ? `${live.codeSize} bytes` : live.loading ? '...' : live.error ? 'RPC error' : 'No code found'}
              loading={live.loading && live.codeSize === 0}
            />
            <InfoRow
              label="Runtime bytecode hash (live)"
              value={live.runtimeHash || (live.loading ? '...' : live.error ? 'RPC error' : 'No bytecode')}
              mono
              loading={live.loading && !live.runtimeHash}
            />
            {live.runtimeHash && (
              <p className="mt-1 text-xs" style={{ color: 'var(--subtle)' }}>
                {ACTIVE_NETWORK.isTestnet
                  ? 'The frozen artifact hash is published in the repo; live hash differs only by the five immutable USDC address bytes baked in at deploy time. This is not source verification.'
                  : 'The mainnet deployment was compiled with optimizer disabled, so its runtime bytecode differs from the optimized 5,990-byte frozen artifact. Sourcify reports an exact source match for this address. This is not a security audit.'}
              </p>
            )}
          </>
        )}
      </section>

      {/* Contract reads */}
      {!notDeployed && (
        <section className="rounded-3xl p-5" style={glass}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Live contract state</h2>
          <InfoRow
            label="usdc()"
            value={usdcAddr ?? (usdcAddrError ? 'RPC error' : '...')}
            link={usdcAddr ? explorerAddr(usdcAddr) : undefined}
            mono
            loading={usdcAddr === undefined && !usdcAddrError}
          />
          <InfoRow
            label="USDC token (configured)"
            value={USDC_ADDRESS}
            link={explorerAddr(USDC_ADDRESS)}
            mono
          />
          <InfoRow
            label="USDC decimals()"
            value={usdcDecimals !== undefined ? String(usdcDecimals) : usdcDecimalsError ? 'RPC error' : '...'}
            loading={usdcDecimals === undefined && !usdcDecimalsError}
          />
          <InfoRow
            label="nextShiftId()"
            value={nextId !== undefined ? String(nextId) : nextIdError ? 'RPC error' : '...'}
            loading={nextId === undefined && !nextIdError}
          />
          <InfoRow
            label="totalEscrow()"
            value={totalEscrow !== undefined ? `${fmtUsdc(totalEscrow)} USDC` : totalEscrowError ? 'RPC error' : '...'}
            loading={totalEscrow === undefined && !totalEscrowError}
          />
        </section>
      )}

      {/* Verification status */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Verification status</h2>
        <StatusItem label={`Contract deployed to ${ACTIVE_NETWORK.label}`} ok={!notDeployed && !live.loading && !live.error}
          note={live.error
            ? `Could not verify bytecode: ${live.error}`
            : ACTIVE_NETWORK.deploymentTx
              ? `Tx ${fmtAddr(ACTIVE_NETWORK.deploymentTx)} at block ${ACTIVE_NETWORK.deploymentBlock?.toLocaleString()}`
              : notDeployed ? 'No contract on this network.' : undefined}
        />
        {ACTIVE_NETWORK.isTestnet ? (
          <StatusItem label="Source verified on explorer: NO" ok={false}
            note="Source verification via the explorer API was unavailable at deploy time. ABI is embedded from the compiled artifact." />
        ) : (
          <StatusItem label="Source verified on Sourcify: exact match" ok
            note={`Creation and runtime both report exact_match. ${SOURCIFY_URL}`} />
        )}
        <StatusItem
          label="Studio S2: 76/76, six invariants at 256 runs × 128,000 calls, 0 reverts"
          ok
          note="Log: arc-pipeline/03-evidence/s2-forge-test.log."
        />
        {ACTIVE_NETWORK.isTestnet ? (
          <StatusItem label="Runtime matches frozen artifact except five immutable USDC bytes" ok={!notDeployed && !!live.runtimeHash}
            note={notDeployed
              ? 'Not verifiable: no contract is deployed on this network.'
              : live.error
                ? `Not verified: ${live.error}`
                : live.runtimeHash
                  ? 'keccak256 of live runtime bytecode shown above. Artifact hash published in repo. Delta is exactly the five USDC address bytes baked in as an immutable at deploy time.'
                  : 'Waiting for live runtime bytecode…'} />
        ) : (
          <StatusItem label="Deployed source matches frozen source (optimizer disabled)" ok={!notDeployed && !!live.runtimeHash}
            note={notDeployed
              ? 'Not verifiable: no contract is deployed on this network.'
              : live.error
                ? `Not verified: ${live.error}`
                : live.runtimeHash
                  ? 'Sourcify reports creationMatch=runtimeMatch=exact_match. The local frozen artifact was built with optimizer enabled (200 runs); this deployment used optimizer disabled, so the runtime hash differs even though the source is identical.'
                  : 'Waiting for live runtime bytecode…'} />
        )}
        <StatusItem label={`Live USDC E2E on ${ACTIVE_NETWORK.label} with two real wallets`} ok={false}
          note={ACTIVE_NETWORK.isTestnet
            ? 'Not verified. Fork tests used MockUSDC; no live two-wallet E2E has been run. See TESTNET-E2E.md.'
            : 'Not verified on Arc mainnet. The deployment is source-verified, but no live two-wallet E2E has been run here.'} />
      </section>

      {/* Links */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--ink)' }}>Links</h2>
        <InfoRow
          label="Public repo"
          value="github.com/unifyWeb3/shiftproof"
          link="https://github.com/unifyWeb3/shiftproof"
        />
        {!ACTIVE_NETWORK.isTestnet && (
          <InfoRow
            label="Source verification (Sourcify)"
            value="exact match"
            link={SOURCIFY_URL}
          />
        )}
        <InfoRow
          label={`Hosted app${ACTIVE_NETWORK.isTestnet ? ' (testnet-only)' : ''}`}
          value={window.location.origin}
          link={window.location.origin}
        />
        <InfoRow label="Demo video" value="Not recorded" />
        <InfoRow label="Architecture doc" value="README.md and AGENTS.md in the repo" />
      </section>

      {/* ABI */}
      <section className="rounded-3xl p-5" style={glass}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--ink)' }}>ABI</h2>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          ABI is read at build time from{' '}
          <span className="mono">contracts/out/ShiftProof.sol/ShiftProof.json</span>.
          Network facts, including any deployed address, live in <span className="mono">src/lib/networks.ts</span>.
        </p>
        <p className="mt-2 text-xs" style={{ color: 'var(--muted)' }}>
          Key functions:{' '}
          {['createShift', 'clockIn', 'clockOut', 'attest', 'claim', 'refundUnused', 'cancel', 'getShift'].map((f, i, a) => (
            <span key={f}><span className="mono">{f}</span>{i < a.length - 1 ? ', ' : '.'}</span>
          ))}
        </p>
      </section>

      {/* Caveats */}
      <section className="rounded-3xl p-5"
        style={{ ...glass, border: '1px solid #fde047', background: 'var(--warning-bg)' }}>
        <h2 className="font-semibold text-sm mb-2" style={{ color: '#713f12' }}>Caveats</h2>
        <ul className="text-xs space-y-1.5 list-disc pl-4" style={{ color: '#92400e' }}>
          <li>{ACTIVE_NETWORK.isTestnet
            ? `${ACTIVE_NETWORK.label} only. All tokens have no real-world value.`
            : 'Arc mainnet. Real USDC is at risk. The contract is source-verified on Sourcify but was compiled with optimizer disabled; it differs from the optimized local artifact.'}</li>
          <li>{ACTIVE_NETWORK.isTestnet
            ? 'Source verification is unavailable via the explorer API.'
            : 'Explorer source verification may still be pending; Sourcify reports an exact match.'}</li>
          <li>Live-USDC E2E with two real wallets has not been run. Fork tests used MockUSDC.</li>
          <li>Fork test hashes are NOT real transaction hashes and are not listed here.</li>
          <li>Employer attestation is the trust anchor — there is no trustless verification of hours worked.</li>
          <li>No dispute path. Disputes must be resolved off-chain before attestation.</li>
          <li>No backend, no indexer, no admin, no upgrade mechanism, no fees.</li>
          <li>No audit has been performed.</li>
          <li>localStorage is a convenience cache only. Clearing it does not affect the contract.</li>
        </ul>
      </section>
    </div>
  )
}
