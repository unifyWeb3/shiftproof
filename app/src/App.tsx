import { usePath, matchPath } from './lib/router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Employer from './pages/Employer'
import Worker from './pages/Worker'
import ShiftReceipt from './pages/ShiftReceipt'
import Proof from './pages/Proof'
import Help from './pages/Help'

export default function App() {
  const [path] = usePath()

  const shiftMatch = matchPath('/shift/:id', path)
  const shiftId = shiftMatch ? parseInt(shiftMatch.id, 10) : null

  const page = () => {
    if (path === '/')         return <Home />
    if (path === '/employer') return <Employer />
    if (path === '/worker')   return <Worker />
    if (path === '/proof')    return <Proof />
    if (path === '/help')     return <Help />
    if (shiftId !== null && !isNaN(shiftId)) return <ShiftReceipt shiftId={shiftId} />
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="display text-2xl font-bold" style={{ color: 'var(--ink)' }}>404</p>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Page not found.</p>
        <a href="/" className="text-sm font-semibold underline" style={{ color: 'var(--accent-hover)' }}>Go home</a>
      </div>
    )
  }

  return (
    <Layout>
      {page()}
    </Layout>
  )
}
