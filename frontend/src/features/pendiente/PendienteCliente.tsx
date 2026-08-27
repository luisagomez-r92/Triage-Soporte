import { useState } from 'react'
import SearchBar from '../../components/SearchBar'
import TicketListCard from '../../components/TicketListCard'
import { useCollapsibleList } from '../../hooks/useCollapsibleList'
import { useSearch } from '../../hooks/useSearch'
import { MOCK_TICKETS } from '../../lib/mockTickets'
import type { Ticket } from '../../types/ticket'

function getPendienteKey(ticket: Ticket): number {
  // "Hora en que pasó a 'Pendiente cliente'" (REQUIREMENTS.md §6) = última entrada de
  // historial, ya que es el estado actual del ticket en esta pestaña.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

function PendienteCliente() {
  const pendienteTickets = MOCK_TICKETS.filter(
    (ticket) => ticket.estado === 'Pendiente cliente',
  ).sort((a, b) => getPendienteKey(a) - getPendienteKey(b))

  const { query, setQuery, matchedIds, resultCount } = useSearch(pendienteTickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? pendienteTickets.filter((ticket) => matchedIds.has(ticket.id))
    : pendienteTickets

  const { visibleTickets: ticketsAMostrar, canCollapse, hasHiddenMatch, hiddenCount, isExpanded, toggle } =
    useCollapsibleList(visibleTickets, matchedIds)

  return (
    <div className="bg-fondo p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <h1 className="text-sm font-semibold text-navy">Todos los casos</h1>
          <span className="rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
            {pendienteTickets.length}
          </span>
        </div>

        <div className="mb-4">
          <SearchBar query={query} onQueryChange={setQuery} resultCount={resultCount} />
        </div>

        <div className="flex flex-col gap-3">
          {ticketsAMostrar.map((ticket) => (
            <TicketListCard
              key={ticket.id}
              ticket={ticket}
              expanded={expandedTicketId === ticket.id}
              onToggle={() =>
                setExpandedTicketId((current) => (current === ticket.id ? null : ticket.id))
              }
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
    </div>
  )
}

export default PendienteCliente
