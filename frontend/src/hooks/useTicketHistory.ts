import { useEffect, useState } from 'react'
import type { TicketHistoryEntry } from '../types/ticket'

interface TicketHistoryResponse {
  ok: boolean
  historial?: TicketHistoryEntry[]
  error?: string
}

interface UseTicketHistoryResult {
  historial: TicketHistoryEntry[] | null
  loading: boolean
  error: boolean
}

// Estado 100% local — no toca useTickets ni el polling de 30s (REQUIREMENTS.md §9
// "Historial del ticket — implementación"). Pensado para usarse dentro de un componente
// que solo se monta cuando el Modal/Panel de detalle está abierto: el fetch ocurre al
// montar y no hay nada que "cerrar" explícitamente, React lo limpia solo al desmontar.
export function useTicketHistory(ticketId: string): UseTicketHistoryResult {
  const [historial, setHistorial] = useState<TicketHistoryEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(false)
      try {
        const response = await fetch(`/api/jira/tickets/${encodeURIComponent(ticketId)}/history`)
        const data: TicketHistoryResponse = await response.json()

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? `El backend respondió con error ${response.status}`)
        }

        if (!cancelled) setHistorial(data.historial ?? [])
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [ticketId])

  return { historial, loading, error }
}
