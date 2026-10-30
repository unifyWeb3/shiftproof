/**
 * Tiny path router — shared external store so all usePath() callers
 * see the same path and re-render together on navigate().
 *
 * Uses useSyncExternalStore so there is no stale-closure problem:
 * Layout's navigate() and App's path read from the same module-level
 * variable; both update atomically on every push.
 */
import { useSyncExternalStore, useCallback } from 'react'

// ─── Shared store ─────────────────────────────────────────────────────────────

let currentPath = window.location.pathname
const listeners = new Set<() => void>()
const emit = () => listeners.forEach(l => l())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => { listeners.delete(cb) }
}

const getSnapshot = () => currentPath

// Keep in sync with browser back / forward.
window.addEventListener('popstate', () => {
  currentPath = window.location.pathname
  emit()
})

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePath(): [string, (p: string) => void] {
  const path = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const navigate = useCallback((p: string) => {
    if (p === currentPath) return
    window.history.pushState(null, '', p)
    currentPath = p
    emit()
  }, [])

  return [path, navigate]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract named segments: matchPath('/shift/:id', '/shift/42') => { id: '42' } */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patParts  = pattern.split('/')
  const pathParts = path.split('/')
  if (patParts.length !== pathParts.length) return null
  const params: Record<string, string> = {}
  for (let i = 0; i < patParts.length; i++) {
    if (patParts[i].startsWith(':')) {
      params[patParts[i].slice(1)] = decodeURIComponent(pathParts[i])
    } else if (patParts[i] !== pathParts[i]) {
      return null
    }
  }
  return params
}
