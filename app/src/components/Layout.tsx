import { type ReactNode } from 'react'
import { ConnectKitButton } from 'connectkit'
import { ShieldCheck, Briefcase, HardHat, FileText, HelpCircle } from 'lucide-react'
import { usePath } from '../lib/router'
import { CONTRACT_ADDRESS, CHAIN_ID, CHAIN_NAME, explorerAddr } from '../lib/contract'
import { ACTIVE_NETWORK, hasContract } from '../lib/networks'

const NAV = [
  { path: '/',         label: 'Home',     icon: ShieldCheck },
  { path: '/employer', label: 'Employer', icon: Briefcase },
  { path: '/worker',   label: 'Worker',   icon: HardHat },
  { path: '/proof',    label: 'Proof',    icon: FileText },
  { path: '/help',     label: 'Help',     icon: HelpCircle },
]

export default function Layout({ children }: { children: ReactNode }) {
  const [path, navigate] = usePath()

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg-gradient)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.78)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid var(--border)',
        }}>
        <button onClick={() => navigate('/')} className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: 'var(--accent)' }}>
            <ShieldCheck className="size-4 text-white" />
          </div>
          <span className="display text-base font-semibold" style={{ color: 'var(--ink)' }}>ShiftProof</span>
        </button>
        <ConnectKitButton />
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">{children}</main>

      {/* Footer */}
      <footer className="px-4 py-3 text-center space-y-1"
        style={{ borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}>
        {hasContract ? (
          <p className="mono text-xs break-all" style={{ color: 'var(--subtle)' }}>
            <a href={explorerAddr(CONTRACT_ADDRESS)} target="_blank" rel="noreferrer"
              className="underline" style={{ color: 'var(--accent-hover)' }}>
              {CONTRACT_ADDRESS}
            </a>
          </p>
        ) : (
          <p className="text-xs" style={{ color: 'var(--subtle)' }}>Not deployed on this network</p>
        )}
        <p className="text-xs" style={{ color: 'var(--subtle)' }}>
          {CHAIN_NAME} · chain {CHAIN_ID}{ACTIVE_NETWORK.isTestnet ? ' · testnet only' : ''}
        </p>
      </footer>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 z-30 flex items-center justify-around px-2 py-2"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: '1px solid var(--border)',
        }}>
        {NAV.map(({ path: p, label, icon: Icon }) => {
          const active = path === p || (p !== '/' && path.startsWith(p))
          return (
            <button key={p} onClick={() => navigate(p)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors"
              style={{ color: active ? 'var(--accent)' : 'var(--subtle)', background: active ? 'rgba(18,45,69,0.07)' : 'transparent' }}>
              <Icon className="size-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
