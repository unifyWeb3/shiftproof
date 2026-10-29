/**
 * Tiny path router — no dependency. Uses History API.
 * Vite dev server handles unknown paths via index.html fallback.
 */
import { useState, useEffect, useCallback } from 'react'

export function usePath(): [string, (p: string) => void] {
  const [path, setPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((p: string) => {
    window.history.pushState(null, '', p)
    setPath(p)
  }, [])

  return [path, navigate]
}

/** Extract a segment: matchPath('/shift/:id', '/shift/42') => { id: '42' } */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patParts = pattern.split('/')
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
