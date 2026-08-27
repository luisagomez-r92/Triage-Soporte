import { useCallback, useEffect, useState } from 'react'
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
  refetch: () => void
}

// Fetch simple al montar, sin WebSocket ni polling todavía — eso es el siguiente paso
// (REQUIREMENTS.md §9/§10). Vive en App.tsx, no en cada pestaña, para no repetir el
// fetch cada vez que el usuario cambia de tab.
export function useTickets(): UseTicketsResult {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/jira/test')
        const data: JiraTestResponse = await response.json()

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? `El backend respondió con error ${response.status}`)
        }

        if (data.unmapped && data.unmapped.length > 0) {
          console.warn('Tickets con status de Jira sin mapear:', data.unmapped)
        }

        if (!cancelled) setTickets(data.tickets ?? [])
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : 'No se pudo conectar con el backend')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  return { tickets, loading, error, refetch }
}
