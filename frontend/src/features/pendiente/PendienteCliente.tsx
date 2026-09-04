import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar'
import SearchResultNavigator from '../../components/SearchResultNavigator'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketListColumn from '../../components/TicketListColumn'
import { compararPorRank } from '../../hooks/useN2PositionBadges'
import { useSearch } from '../../hooks/useSearch'
import { useSearchResultNavigation } from '../../hooks/useSearchResultNavigation'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { Ticket, TicketStatus } from '../../types/ticket'

const PENDIENTE_ESTADOS: TicketStatus[] = ['Pendiente cliente', 'Pendiente Tech']

function getPendienteKey(ticket: Ticket): number {
  // "Hora en que pasó a 'Pendiente cliente'" (REQUIREMENTS.md §6) = última entrada de
  // historial, ya que es el estado actual del ticket en esta columna.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

interface PendienteClienteProps {
  tickets: Ticket[]
}

function PendienteCliente({ tickets }: PendienteClienteProps) {
  const pendienteTabTickets = tickets.filter((ticket) => PENDIENTE_ESTADOS.includes(ticket.estado))
  const { query, setQuery, matchedIds, resultCount } = useSearch(pendienteTabTickets)
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? pendienteTabTickets.filter((ticket) => matchedIds.has(ticket.id))
    : pendienteTabTickets

  const pendienteCliente = visibleTickets
    .filter((ticket) => ticket.estado === 'Pendiente cliente')
    .sort((a, b) => getPendienteKey(a) - getPendienteKey(b))

  // Columna "Pendiente Tech" (CORRECCIÓN — mudada desde Nivel 2 – Especialistas): mismo
  // orden por Rank de Jira que tenía allá, sin badge de posición por persona (ese sigue
  // siendo exclusivo de Escalados/En curso).
  const pendienteTech = visibleTickets
    .filter((ticket) => ticket.estado === 'Pendiente Tech')
    .sort(compararPorRank)

  const orderedMatchedIds = useMemo(() => {
    if (!matchedIds) return []
    return [...pendienteCliente, ...pendienteTech].map((ticket) => ticket.id)
  }, [matchedIds, pendienteCliente, pendienteTech])

  const {
    activeIndex: resultIndex,
    total: resultTotal,
    goToNext: goToNextResult,
    goToPrev: goToPrevResult,
  } = useSearchResultNavigation(orderedMatchedIds)

  const toggleDetalle = (ticketId: string) =>
    setExpandedTicketId((current) => (current === ticketId ? null : ticketId))

  return (
    <div className="bg-white p-6">
      <div className="mb-4">
        <SearchBar
          totalCount={pendienteTabTickets.length}
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

      <div className="flex gap-4 overflow-x-auto pb-2">
        <TicketListColumn
          title="Pendiente cliente"
          tickets={pendienteCliente}
          matchedIds={matchedIds}
          expandedTicketId={expandedTicketId}
          onToggleTicketDetail={toggleDetalle}
        />
        <TicketListColumn
          title="Pendiente Tech"
          tickets={pendienteTech}
          matchedIds={matchedIds}
          expandedTicketId={expandedTicketId}
          onToggleTicketDetail={toggleDetalle}
        />
      </div>
      {resultTotal > 1 && (
        <SearchResultNavigator
          activeIndex={resultIndex}
          total={resultTotal}
          onPrev={goToPrevResult}
          onNext={goToNextResult}
        />
      )}
    </div>
  )
}

export default PendienteCliente
