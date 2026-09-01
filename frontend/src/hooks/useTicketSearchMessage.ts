import { useEffect, useMemo, useState } from 'react'
import { getTabLabelForTicket } from '../lib/ticketTabs'
import type { Ticket } from '../types/ticket'

export type TicketSearchMessage =
  | { kind: 'other-tab'; tabLabel: string }
  | { kind: 'closed' }
  | { kind: 'not-found' }

interface UseTicketSearchMessageResult {
  message: TicketSearchMessage | null
  loading: boolean
}

// Solo dispara la consulta remota cuando el texto calza con un ticket key completo — no
// en cada tecla mientras se escribe "ST-119..." (REQUIREMENTS.md §5).
const TICKET_KEY_PATTERN = /^st-\d+$/i
const DEBOUNCE_MS = 400

type RemoteStatus = 'idle' | 'loading' | { found: boolean; isDone: boolean }

// REQUIREMENTS.md §5 "Mensajes de búsqueda según estado del ticket" (pestañas N1, N2,
// Pendiente): distingue ticket activo-en-otra-pestaña (sin llamar a Jira, ya está
// cargado localmente) de cerrado/inexistente (sí requiere una consulta puntual, bajo
// demanda — ver GET /api/jira/tickets/:id/status).
export function useTicketSearchMessage(
  query: string,
  localResultCount: number | null,
  allTickets: Ticket[],
): UseTicketSearchMessageResult {
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>('idle')

  const trimmedQuery = query.trim()
  const looksLikeTicketKey = TICKET_KEY_PATTERN.test(trimmedQuery)
  const hasLocalMatches = (localResultCount ?? 0) > 0
  const shouldCheckOtherTab = looksLikeTicketKey && !hasLocalMatches

  const foundInOtherTab = useMemo(() => {
    if (!shouldCheckOtherTab) return null
    return allTickets.find((t) => t.id.toLowerCase() === trimmedQuery.toLowerCase()) ?? null
  }, [shouldCheckOtherTab, allTickets, trimmedQuery])

  const shouldCheckRemote = shouldCheckOtherTab && !foundInOtherTab

  useEffect(() => {
    if (!shouldCheckRemote) {
      setRemoteStatus('idle')
      return
    }

    let cancelled = false
    setRemoteStatus('loading')

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/jira/tickets/${encodeURIComponent(trimmedQuery)}/status`,
        )
        const data = await response.json()
        if (cancelled) return
        if (!response.ok || !data.ok) {
          setRemoteStatus('idle')
          return
        }
        setRemoteStatus({ found: data.found, isDone: data.statusCategoryKey === 'done' })
      } catch {
        if (!cancelled) setRemoteStatus('idle')
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [shouldCheckRemote, trimmedQuery])

  if (hasLocalMatches || !looksLikeTicketKey) {
    return { message: null, loading: false }
  }

  if (foundInOtherTab) {
    return { message: { kind: 'other-tab', tabLabel: getTabLabelForTicket(foundInOtherTab) }, loading: false }
  }

  if (remoteStatus === 'loading') {
    return { message: null, loading: true }
  }

  if (remoteStatus !== 'idle' && remoteStatus.found && remoteStatus.isDone) {
    return { message: { kind: 'closed' }, loading: false }
  }

  // Fallback conservador: no encontrado localmente, no confirmado como cerrado (o la
  // consulta remota falló) — mismo mensaje genérico de siempre (caso 3).
  return { message: { kind: 'not-found' }, loading: false }
}
