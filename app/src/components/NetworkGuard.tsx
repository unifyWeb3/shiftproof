import { useAccount, useSwitchChain } from 'wagmi'
import { CHAIN_ID, CHAIN_NAME, CHAIN_RPC, EXPLORER_BASE } from '../lib/contract'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'

interface Props {
  /** When true, also renders children on the wrong chain (banner + content).
   *  When false (default), only renders the banner when wrong chain and NO children. */
  wrapWrites?: boolean
  children: React.ReactNode
}

/**
 * Shows a "wrong network" banner with a user-clicked switch button.
 * NEVER hides page content. NEVER auto-switches.
 * Exports a hook so callers can gate write-button disabled state.
 */
export default function NetworkGuard({ children }: Props) {
  const { isConnected, chainId } = useAccount()
  const { switchChain, isPending } = useSwitchChain()

  const isWrongChain = isConnected && chainId !== CHAIN_ID

  const handleSwitch = () => {
    // Try switching; if the chain is unknown to the wallet, add it first via wallet_addEthereumChain
    switchChain(
      { chainId: CHAIN_ID },
      {
        onError: () => {
          // Wallet doesn't know this chain yet — add it
          if (window.ethereum) {
            void (window.ethereum as {
              request: (args: { method: string; params: unknown[] }) => Promise<void>
            }).request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${CHAIN_ID.toString(16)}`,
                chainName: CHAIN_NAME,
                rpcUrls: [CHAIN_RPC],
                nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: ACTIVE_NETWORK.nativeDecimals },
                blockExplorerUrls: [EXPLORER_BASE],
              }],
            })
          }
        },
      },
    )
  }

  return (
    <>
      {!hasContract && (
        <div className="rounded-2xl p-4 flex items-start gap-3 mb-4"
          style={{ background: 'rgba(186,43,76,0.06)', border: '1px solid var(--danger)' }}>
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: 'var(--danger)', color: '#fff' }}>!</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Not deployed on this network</p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--ink-2)' }}>
              ShiftProof has no contract on {CHAIN_NAME} (chain {CHAIN_ID}). All write actions are disabled.
            </p>
          </div>
        </div>
      )}
      {isWrongChain && (
        <div className="rounded-2xl p-4 flex items-start gap-3 mb-4"
          style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)' }}>
          <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: '#fde047', color: '#713f12' }}>!</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#713f12' }}>Wrong network</p>
            <p className="mt-0.5 text-xs" style={{ color: '#92400e' }}>
              ShiftProof is on {CHAIN_NAME} (chain {CHAIN_ID}). You are on chain {chainId}.
              Writes are disabled until you switch. Browsing still works.
            </p>
            <button
              onClick={handleSwitch}
              disabled={isPending}
              className="mt-2 rounded-xl px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              style={{ background: '#fde047', color: '#713f12' }}>
              {isPending ? 'Switching...' : `Switch to ${CHAIN_NAME}`}
            </button>
          </div>
        </div>
      )}
      {children}
    </>
  )
}

/** Returns true if a write should be disabled due to wrong chain. */
export function useWrongChain(): boolean {
  const { isConnected, chainId } = useAccount()
  return isConnected && chainId !== CHAIN_ID
}
