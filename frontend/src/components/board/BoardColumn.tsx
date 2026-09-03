import { useState } from 'react'
import TicketCard from './TicketCard'
import type { Ticket } from '../../types/ticket'

const VISIBLE_COUNT = 3

interface BoardColumnProps {
  title: string
  tickets: Ticket[]
  matchedIds: Set<string> | null
  onTicketClick: (ticket: Ticket) => void
  // Badge de posición por persona (REQUIREMENTS.md §4/§5) — opcional porque solo aplica
  // a tickets de Nivel 2; para el resto, el lookup simplemente no encuentra nada.
  getPositionBadge?: (ticket: Ticket) => number | undefined
}

function BoardColumn({
  title,
  tickets,
  matchedIds,
  onTicketClick,
  getPositionBadge,
}: BoardColumnProps) {
  const [expanded, setExpanded] = useState(false)

  const hiddenCount = tickets.length - VISIBLE_COUNT
  const canCollapse = hiddenCount > 0
  const hasHiddenMatch =
    canCollapse &&
    matchedIds !== null &&
    tickets.slice(VISIBLE_COUNT).some((ticket) => matchedIds.has(ticket.id))

  const isExpanded = expanded || hasHiddenMatch
  const visibleTickets = canCollapse && !isExpanded ? tickets.slice(0, VISIBLE_COUNT) : tickets

  return (
    <div className="flex min-h-[400px] flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
        <span className="rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {visibleTickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            matchState={
              matchedIds ? (matchedIds.has(ticket.id) ? 'match' : 'dimmed') : undefined
            }
            detailTrigger={{ mode: 'modal', onOpenDetail: onTicketClick }}
            positionBadge={getPositionBadge?.(ticket)}
          />
        ))}
        {canCollapse && !hasHiddenMatch && (
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="text-xs font-medium text-accent hover:underline"
          >
            {isExpanded ? 'Ver menos' : `Ver ${hiddenCount} más`}
          </button>
        )}
      </div>
    </div>
  )
}

export default BoardColumn
