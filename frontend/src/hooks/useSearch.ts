import { useMemo, useState } from 'react'
import type { Ticket } from '../types/ticket'

function normalize(value: string) {
  return value.trim().toLowerCase()
}

export function useSearch(tickets: Ticket[]) {
  const [query, setQuery] = useState('')

  const matchedIds = useMemo(() => {
    const normalizedQuery = normalize(query)
    if (!normalizedQuery) {
      return null
    }

    return new Set(
      tickets
        .filter(
          (ticket) =>
            normalize(ticket.id).includes(normalizedQuery) ||
            normalize(ticket.solicitante).includes(normalizedQuery),
        )
        .map((ticket) => ticket.id),
    )
  }, [tickets, query])

  return {
    query,
    setQuery,
    matchedIds,
    resultCount: matchedIds?.size ?? null,
  }
}
