import { useState } from 'react'
import TicketListCard from './TicketListCard'
import type { Ticket } from '../types/ticket'

const VISIBLE_COUNT = 3

interface AgentColumnProps {
  agentName: string
  tickets: Ticket[]
  matchedIds: Set<string> | null
  expandedTicketId: string | null
  onToggleTicketDetail: (ticketId: string) => void
}

function AgentColumn({
  agentName,
  tickets,
  matchedIds,
  expandedTicketId,
  onToggleTicketDetail,
}: AgentColumnProps) {
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
    <div className="flex w-80 flex-shrink-0 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy">{agentName}</h2>
        <span className="rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
          {tickets.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {visibleTickets.map((ticket) => (
          <TicketListCard
            key={ticket.id}
            ticket={ticket}
            expanded={expandedTicketId === ticket.id}
            onToggle={() => onToggleTicketDetail(ticket.id)}
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

export default AgentColumn
