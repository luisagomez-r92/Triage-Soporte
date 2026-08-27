import { useState } from 'react'
import type { Ticket } from '../types/ticket'

const VISIBLE_COUNT = 3

export function useCollapsibleList(tickets: Ticket[], matchedIds: Set<string> | null) {
  const [expanded, setExpanded] = useState(false)

  const hiddenCount = tickets.length - VISIBLE_COUNT
  const canCollapse = hiddenCount > 0
  const hasHiddenMatch =
    canCollapse &&
    matchedIds !== null &&
    tickets.slice(VISIBLE_COUNT).some((ticket) => matchedIds.has(ticket.id))

  const isExpanded = expanded || hasHiddenMatch
  const visibleTickets = canCollapse && !isExpanded ? tickets.slice(0, VISIBLE_COUNT) : tickets

  return {
    visibleTickets,
    canCollapse,
    hasHiddenMatch,
    hiddenCount,
    isExpanded,
    toggle: () => setExpanded((prev) => !prev),
  }
}
