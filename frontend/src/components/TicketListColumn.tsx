import TicketListCard from './TicketListCard'
import { useCollapsibleList } from '../hooks/useCollapsibleList'
import type { Ticket } from '../types/ticket'

interface TicketListColumnProps {
  title: string
  tickets: Ticket[]
  matchedIds: Set<string> | null
  expandedTicketId: string | null
  onToggleTicketDetail: (ticketId: string) => void
  // Badge de posición por persona (REQUIREMENTS.md §5, "Vista de tres columnas en Nivel
  // 2 – Especialistas") — opcional porque solo aplica a "Escalados"/"En curso" de esa
  // pestaña, no a las demás pestañas que también usan esta columna.
  getPositionBadge?: (ticket: Ticket) => number | undefined
}

function TicketListColumn({
  title,
  tickets,
  matchedIds,
  expandedTicketId,
  onToggleTicketDetail,
  getPositionBadge,
}: TicketListColumnProps) {
  const { visibleTickets, canCollapse, hasHiddenMatch, hiddenCount, isExpanded, toggle } =
    useCollapsibleList(tickets, matchedIds)

  return (
    <div className="flex w-80 flex-shrink-0 flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
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
            positionBadge={getPositionBadge?.(ticket)}
          />
        ))}
        {canCollapse && !hasHiddenMatch && (
          <button
            type="button"
            onClick={toggle}
            className="text-xs font-medium text-accent hover:underline"
          >
            {isExpanded ? 'Ver menos' : `Ver ${hiddenCount} más`}
          </button>
        )}
      </div>
    </div>
  )
}

export default TicketListColumn
