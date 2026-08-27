import { useState } from 'react'
import BoardColumn from '../../components/board/BoardColumn'
import SearchBar from '../../components/SearchBar'
import SearchResultsList from '../../components/board/SearchResultsList'
import TicketDetailModal from '../../components/board/TicketDetailModal'
import { useSearch } from '../../hooks/useSearch'
import { MOCK_TICKETS } from '../../lib/mockTickets'
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

function getTicketsForColumn(estados: TicketStatus[]) {
  // Ordena por la posición del estado dentro de `estados` (ej. en Nivel 2, "En curso
  // N2" antes que "Escalado a N2") para que el ticket en curso nunca caiga dentro del
  // colapso de la cola. El orden fino dentro de cada estado (hora, prioridad/Rank de
  // Jira) llega con la integración real — ver REQUIREMENTS.md §6 y §9.
  return MOCK_TICKETS.filter((ticket) => estados.includes(ticket.estado)).sort(
    (a, b) => estados.indexOf(a.estado) - estados.indexOf(b.estado),
  )
}

function TableroGeneral() {
  const { query, setQuery, matchedIds, resultCount } = useSearch(MOCK_TICKETS)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  const searchResults = matchedIds
    ? MOCK_TICKETS.filter((ticket) => matchedIds.has(ticket.id)).map((ticket) => ({
        ticket,
        columnTitle: getColumnTitle(ticket.estado),
      }))
    : []

  return (
    <div className="bg-fondo p-6">
      <div className="mb-4">
        <SearchBar query={query} onQueryChange={setQuery} resultCount={resultCount} />
      </div>
      {matchedIds && (
        <div className="mb-4">
          <SearchResultsList results={searchResults} />
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map(({ title, estados }) => (
          <BoardColumn
            key={title}
            title={title}
            tickets={getTicketsForColumn(estados)}
            matchedIds={matchedIds}
            onTicketClick={setSelectedTicket}
          />
        ))}
      </div>
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  )
}

export default TableroGeneral
