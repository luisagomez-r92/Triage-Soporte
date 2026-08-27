import { useCallback, useEffect, useRef, useState } from 'react'
import type { Ticket } from '../types/ticket'

interface JiraTestResponse {
  ok: boolean
  tickets?: Ticket[]
  unmapped?: { key: string; statusName: string }[]
  error?: string
}

interface UseTicketsResult {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  // Ciclos de polling posteriores al primer fetch — REQUIREMENTS.md §9/§10 "polling
  // cada 30-60s". No confundir con `loading`/`error`, que son solo para el primer fetch.
  isRefreshing: boolean
  refreshError: string | null
  lastUpdatedAt: number | null
  refetch: () => void
}

export const POLL_INTERVAL_MS = 30_000

// Fetch al montar + polling automático cada POLL_INTERVAL_MS, pausado mientras la
// pestaña no está visible. Un ciclo fallido no borra los tickets ya mostrados — solo
// se refleja en `refreshError` y se reintenta en el siguiente ciclo.
export function useTickets(): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null)

  const ticketsRef = useRef<Ticket[]>([])
  const hasDataRef = useRef(false)
  const mountedRef = useRef(true)

  const fetchTickets = useCallback(async () => {
    const isFirstLoad = !hasDataRef.current
    if (isFirstLoad) {
      setLoading(true)
      setError(null)
    } else {
      setIsRefreshing(true)
    }

    try {
      const response = await fetch('/api/jira/test')
      const data: JiraTestResponse = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `El backend respondió con error ${response.status}`)
      }

      if (data.unmapped && data.unmapped.length > 0) {
        console.warn('Tickets con status de Jira sin mapear:', data.unmapped)
      }

      const nextTickets = data.tickets ?? []
      // Evita re-renders si el polling trae exactamente los mismos datos.
      if (JSON.stringify(nextTickets) !== JSON.stringify(ticketsRef.current)) {
        ticketsRef.current = nextTickets
        if (mountedRef.current) setTickets(nextTickets)
      }

      hasDataRef.current = true
      if (mountedRef.current) {
        setError(null)
        setRefreshError(null)
        setLastUpdatedAt(Date.now())
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'No se pudo conectar con el backend'
      if (!mountedRef.current) return
      if (isFirstLoad) {
        // Todavía no hay nada que mostrar: sí bloquea con el estado de error.
        setError(message)
      } else {
        // Ya había datos en pantalla — no se borran, solo se avisa. El siguiente ciclo
        // de polling reintenta solo, sin acción del usuario.
        setRefreshError(message)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
        setIsRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let paused = false

    async function runCycle() {
      await fetchTickets()
      if (!mountedRef.current) return
      if (document.hidden) {
        // No agenda el siguiente ciclo — el listener de visibilitychange lo retoma.
        paused = true
        return
      }
      timeoutId = setTimeout(runCycle, POLL_INTERVAL_MS)
    }

    function handleVisibilityChange() {
      if (!document.hidden && paused) {
        paused = false
        runCycle()
      }
    }

    runCycle()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mountedRef.current = false
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchTickets])

  const refetch = useCallback(() => {
    fetchTickets()
  }, [fetchTickets])

  return { tickets, loading, error, isRefreshing, refreshError, lastUpdatedAt, refetch }
}
