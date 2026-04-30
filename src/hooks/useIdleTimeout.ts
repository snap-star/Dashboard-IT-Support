/** biome-ignore-all lint/suspicious/useIterableCallbackReturn:. */
'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const IDLE_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const WARNING_BEFORE = 2 * 60 * 1000 // Warn 2 minutes before

export function useIdleTimeout() {
  const router = useRouter()
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }, [router])

  // biome-ignore lint/correctness/useExhaustiveDependencies: The dependencies are correctly specified for the intended behavior of this hook, and adding more dependencies could lead to unintended consequences or performance issues.
  const extendSession = useCallback(async () => {
    // Call server action to refresh token and reset idle
    const res = await fetch('/api/auth/refresh', { method: 'POST' })
    if (!res.ok) {
      logout()
      return
    }
    setShowWarning(false)
    resetTimers()
  }, [logout])

  const resetTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current)

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
    }, IDLE_TIMEOUT - WARNING_BEFORE)

    idleTimerRef.current = setTimeout(() => {
      logout()
    }, IDLE_TIMEOUT)
  }, [logout])

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll']

    const handleActivity = () => {
      resetTimers()
    }

    events.forEach(event => window.addEventListener(event, handleActivity))
    resetTimers()

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity))
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current)
    }
  }, [resetTimers])

  return { showWarning, extendSession, logout }
}
