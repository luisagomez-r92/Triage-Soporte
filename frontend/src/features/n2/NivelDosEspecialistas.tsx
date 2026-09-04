import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar'
import SearchResultNavigator from '../../components/SearchResultNavigator'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketListColumn from '../../components/TicketListColumn'
import { useN2PositionBadges } from '../../hooks/useN2PositionBadges'
import { useSearch } from '../../hooks/useSearch'
import { useSearchResultNavigation } from '../../hooks/useSearchResultNavigation'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { Ticket, TicketStatus } from '../../types/ticket'

// REQUIREMENTS.md §5 "Vista kanban por agente en Nivel 2 – Especialistas" — reemplaza las
// columnas fijas "Escalados"/"En curso". Todo ticket en estos estados ya tiene especialista
// asignado en Jira desde el escalado, así que el filtro de responsable es solo para
// estrechar el tipo (nunca debería excluir nada en la práctica).
const NIVEL2_ESTADOS: TicketStatus[] = ['Escalado a N2', 'En curso N2']

interface NivelDosEspecialistasProps {
  tickets: Ticket[]
}

function NivelDosEspecialistas({ tickets }: NivelDosEspecialistasProps) {
  const nivel2Tickets = tickets.filter(
    (ticket): ticket is Ticket & { responsable: NonNullable<Ticket['responsable']> } =>
      NIVEL2_ESTADOS.includes(ticket.estado) && Boolean(ticket.responsable),
  )
  const { query, setQuery, matchedIds, resultCount } = useSearch(nivel2Tickets)
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? nivel2Tickets.filter((ticket) => matchedIds.has(ticket.id))
    : nivel2Tickets

  // Badge de posición por persona (REQUIREMENTS.md §5) — hook compartido con la columna
  // Nivel 2 del Tablero general, calculado sobre el set de N2 completo (no sobre
  // `visibleTickets`) para que el número no cambie según lo que se esté buscando. Se
  // reutiliza también para ordenar cada columna, así el orden vertical y el número del
  // badge coinciden siempre por construcción (en curso primero, luego escalados por Rank).
  const posicionPorTicket = useN2PositionBadges(tickets)
  const getPositionBadge = (ticket: Ticket) => posicionPorTicket.get(ticket.id)

  const columnas = useMemo(() => {
    const porAgente = new Map<string, Ticket[]>()
    for (const ticket of visibleTickets) {
      const agente = ticket.responsable.nombre
      const grupo = porAgente.get(agente) ?? []
      grupo.push(ticket)
      porAgente.set(agente, grupo)
    }
    return Array.from(porAgente.entries())
      .map(([agente, tickets]) => ({
        agente,
        tickets: [...tickets].sort(
          (a, b) => (posicionPorTicket.get(a.id) ?? 0) - (posicionPorTicket.get(b.id) ?? 0),
        ),
      }))
      .sort((a, b) => a.agente.localeCompare(b.agente))
  }, [visibleTickets, posicionPorTicket])

  // Cuando hay búsqueda activa, `columnas` ya son solo coincidencias (visibleTickets las
  // filtró) — el mismo orden columna-por-columna que se renderiza abajo.
  const orderedMatchedIds = useMemo(() => {
    if (!matchedIds) return []
    return columnas.flatMap(({ tickets }) => tickets.map((ticket) => ticket.id))
  }, [matchedIds, columnas])

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
        {columnas.map(({ agente, tickets }) => (
          <TicketListColumn
            key={agente}
            title={agente}
            tickets={tickets}
            matchedIds={matchedIds}
            expandedTicketId={expandedTicketId}
            onToggleTicketDetail={toggleDetalle}
            getPositionBadge={getPositionBadge}
            statusChipVariant="solid"
          />
        ))}
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
