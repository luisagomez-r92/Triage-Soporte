import { useMemo, useState } from 'react'
import BoardColumn from '../../components/board/BoardColumn'
import SearchBar from '../../components/SearchBar'
import SearchResultNavigator from '../../components/SearchResultNavigator'
import SearchResultsList from '../../components/board/SearchResultsList'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketDetailModal from '../../components/board/TicketDetailModal'
import { useN2PositionBadges } from '../../hooks/useN2PositionBadges'
import { useSearch } from '../../hooks/useSearch'
import { useSearchResultNavigation } from '../../hooks/useSearchResultNavigation'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { Ticket, TicketStatus } from '../../types/ticket'

const COLUMNS: { title: string; estados: TicketStatus[] }[] = [
  { title: 'Nivel 0 – Nuevos', estados: ['En espera'] },
  { title: 'Nivel 1 – Revisión', estados: ['En revisión N1', 'En validación'] },
  { title: 'Nivel 2 – Especialistas', estados: ['En curso N2', 'Escalado a N2', 'Pendiente Tech'] },
  { title: 'Pendiente cliente', estados: ['Pendiente cliente'] },
]

function getColumnTitle(estado: TicketStatus): string {
  return COLUMNS.find((column) => column.estados.includes(estado))?.title ?? ''
}

function getTicketsForColumn(tickets: Ticket[], estados: TicketStatus[]) {
  // Ordena por la posición del estado dentro de `estados` (ej. en Nivel 2, "En curso
  // N2" antes que "Escalado a N2") para que el ticket en curso nunca caiga dentro del
  // colapso de la cola. El orden fino dentro de cada estado (prioridad/Rank de Jira
  // dentro de la cola) llega con WebSocket/polling — ver REQUIREMENTS.md §6 y §9.
  return tickets.filter((ticket) => estados.includes(ticket.estado)).sort(
    (a, b) => estados.indexOf(a.estado) - estados.indexOf(b.estado),
  )
}

interface TableroGeneralProps {
  tickets: Ticket[]
}

function TableroGeneral({ tickets }: TableroGeneralProps) {
  const { query, setQuery, matchedIds, resultCount } = useSearch(tickets)
  // Caso 1 ("activo en otra pestaña") nunca se dispara aquí: la búsqueda del Tablero ya
  // corre sobre el set completo de tickets (no un subconjunto por pestaña), así que si el
  // ticket está activo ya cuenta como coincidencia local — REQUIREMENTS.md §5.
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
  // Badge de posición por persona (REQUIREMENTS.md §4/§5) — mismo hook que usa la
  // pestaña Nivel 2 – Especialistas, así ambas muestran el mismo número.
  const posicionPorTicket = useN2PositionBadges(tickets)
  const getPositionBadge = (ticket: Ticket) => posicionPorTicket.get(ticket.id)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const searchResults = matchedIds
    ? tickets
        .filter((ticket) => matchedIds.has(ticket.id))
        .map((ticket) => ({
          ticket,
          columnTitle: getColumnTitle(ticket.estado),
        }))
    : []

  // Orden visual real: columna por columna (N0→N1→N2→Pendiente), en el mismo orden en
  // que cada columna ya renderiza sus tarjetas — REQUIREMENTS.md §5 "Navegación entre
  // resultados de búsqueda".
  const orderedMatchedIds = useMemo(() => {
    if (!matchedIds) return []
    return COLUMNS.flatMap(({ estados }) =>
      getTicketsForColumn(tickets, estados).filter((ticket) => matchedIds.has(ticket.id)),
    ).map((ticket) => ticket.id)
  }, [matchedIds, tickets])

  const {
    activeIndex: resultIndex,
    total: resultTotal,
    goToNext: goToNextResult,
    goToPrev: goToPrevResult,
  } = useSearchResultNavigation(orderedMatchedIds)

  return (
    <div className="bg-white p-6">
      <div className="mb-4">
        <SearchBar
          totalCount={tickets.length}
          query={query}
          onQueryChange={setQuery}
          resultCount={resultCount}
        />
      </div>
      {matchedIds && (
        <div className="mb-4">
          {resultCount === 0 ? (
            <SearchStatusMessage message={searchMessage} />
          ) : (
            <SearchResultsList results={searchResults} />
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map(({ title, estados }) => (
          <BoardColumn
            key={title}
            title={title}
            tickets={getTicketsForColumn(tickets, estados)}
            matchedIds={matchedIds}
            onTicketClick={setSelectedTicket}
            getPositionBadge={getPositionBadge}
          />
        ))}
      </div>
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
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

export default TableroGeneral
