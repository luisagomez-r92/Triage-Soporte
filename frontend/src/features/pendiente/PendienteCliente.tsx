import { useState } from 'react'
import SearchBar from '../../components/SearchBar'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketListCard from '../../components/TicketListCard'
import { useCollapsibleList } from '../../hooks/useCollapsibleList'
import { useSearch } from '../../hooks/useSearch'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { Ticket } from '../../types/ticket'

function getPendienteKey(ticket: Ticket): number {
  // "Hora en que pasó a 'Pendiente cliente'" (REQUIREMENTS.md §6) = última entrada de
  // historial, ya que es el estado actual del ticket en esta pestaña.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

interface PendienteClienteProps {
  tickets: Ticket[]
}

function PendienteCliente({ tickets }: PendienteClienteProps) {
  const pendienteTickets = tickets
    .filter((ticket) => ticket.estado === 'Pendiente cliente')
    .sort((a, b) => getPendienteKey(a) - getPendienteKey(b))

  const { query, setQuery, matchedIds, resultCount } = useSearch(pendienteTickets)
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? pendienteTickets.filter((ticket) => matchedIds.has(ticket.id))
    : pendienteTickets

  const { visibleTickets: ticketsAMostrar, canCollapse, hasHiddenMatch, hiddenCount, isExpanded, toggle } =
    useCollapsibleList(visibleTickets, matchedIds)

  return (
    <div className="bg-white p-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <SearchBar
            totalCount={pendienteTickets.length}
            query={query}
            onQueryChange={setQuery}
            resultCount={resultCount}
          />
        </div>

        {resultCount === 0 && (
          <div className="mb-4">
            <SearchStatusMessage message={searchMessage} />
          </div>
        )}

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
