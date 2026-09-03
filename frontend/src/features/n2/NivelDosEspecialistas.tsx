import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar'
import SearchResultNavigator from '../../components/SearchResultNavigator'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketListColumn from '../../components/TicketListColumn'
import { compararPorRank, getAsignacionKey, useN2PositionBadges } from '../../hooks/useN2PositionBadges'
import { useSearch } from '../../hooks/useSearch'
import { useSearchResultNavigation } from '../../hooks/useSearchResultNavigation'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { Ticket, TicketStatus } from '../../types/ticket'

const NIVEL2_ESTADOS: TicketStatus[] = ['Escalado a N2', 'Pendiente Tech', 'En curso N2']

interface NivelDosEspecialistasProps {
  tickets: Ticket[]
}

function NivelDosEspecialistas({ tickets }: NivelDosEspecialistasProps) {
  const nivel2Tickets = tickets.filter((ticket) => NIVEL2_ESTADOS.includes(ticket.estado))
  const { query, setQuery, matchedIds, resultCount } = useSearch(nivel2Tickets)
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? nivel2Tickets.filter((ticket) => matchedIds.has(ticket.id))
    : nivel2Tickets

  const escalados = visibleTickets
    .filter((ticket) => ticket.estado === 'Escalado a N2')
    .sort(compararPorRank)

  const pendienteTech = visibleTickets
    .filter((ticket) => ticket.estado === 'Pendiente Tech')
    .sort(compararPorRank)

  const enCurso = visibleTickets
    .filter((ticket) => ticket.estado === 'En curso N2')
    .sort((a, b) => getAsignacionKey(a) - getAsignacionKey(b))

  // Badge de posición por persona (REQUIREMENTS.md §5) — hook compartido con la columna
  // Nivel 2 del Tablero general, calculado sobre el set de N2 completo (no sobre
  // `visibleTickets`) para que el número no cambie según lo que se esté buscando.
  const posicionPorTicket = useN2PositionBadges(tickets)
  const getPositionBadge = (ticket: Ticket) => posicionPorTicket.get(ticket.id)

  // Orden visual: Escalados → En curso → Pendiente Tech (mismo orden de columnas de
  // abajo); cuando hay búsqueda activa, cada array ya son solo coincidencias.
  const orderedMatchedIds = useMemo(() => {
    if (!matchedIds) return []
    return [...escalados, ...enCurso, ...pendienteTech].map((ticket) => ticket.id)
  }, [matchedIds, escalados, enCurso, pendienteTech])

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
          totalCount={nivel2Tickets.length}
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
          title="Escalados"
          tickets={escalados}
          matchedIds={matchedIds}
          expandedTicketId={expandedTicketId}
          onToggleTicketDetail={toggleDetalle}
          getPositionBadge={getPositionBadge}
        />
        <TicketListColumn
          title="En curso"
          tickets={enCurso}
          matchedIds={matchedIds}
          expandedTicketId={expandedTicketId}
          onToggleTicketDetail={toggleDetalle}
          getPositionBadge={getPositionBadge}
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

export default NivelDosEspecialistas
