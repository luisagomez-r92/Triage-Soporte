import { useState } from 'react'
import SearchBar from '../../components/SearchBar'
import TicketListColumn from '../../components/TicketListColumn'
import { useSearch } from '../../hooks/useSearch'
import type { Ticket, TicketStatus } from '../../types/ticket'

const NIVEL2_ESTADOS: TicketStatus[] = ['Escalado a N2', 'Pendiente Tech', 'En curso N2']

function getAsignacionKey(ticket: Ticket): number {
  // "Hora en que el desarrollador tomó el ticket" = última entrada de historial.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

function compararPorRank(a: Ticket, b: Ticket): number {
  // Simula el campo Rank de Jira (LexoRank): comparación lexicográfica del token tal
  // cual vendría del API — nunca se recalcula combinando prioridad + hora
  // (REQUIREMENTS.md §6 y §9).
  return (a.rank ?? '').localeCompare(b.rank ?? '')
}

interface NivelDosEspecialistasProps {
  tickets: Ticket[]
}

function NivelDosEspecialistas({ tickets }: NivelDosEspecialistasProps) {
  const nivel2Tickets = tickets.filter((ticket) => NIVEL2_ESTADOS.includes(ticket.estado))
  const { query, setQuery, matchedIds, resultCount } = useSearch(nivel2Tickets)
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

  const toggleDetalle = (ticketId: string) =>
    setExpandedTicketId((current) => (current === ticketId ? null : ticketId))

  return (
    <div className="bg-fondo p-6">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-sm font-semibold text-navy">Todos los casos</h1>
        <span className="rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
          {nivel2Tickets.length}
        </span>
      </div>

      <div className="mb-4">
        <SearchBar query={query} onQueryChange={setQuery} resultCount={resultCount} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        <TicketListColumn
          title="Escalados"
          tickets={escalados}
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
        <TicketListColumn
          title="En curso"
          tickets={enCurso}
          matchedIds={matchedIds}
          expandedTicketId={expandedTicketId}
          onToggleTicketDetail={toggleDetalle}
        />
      </div>
    </div>
  )
}

export default NivelDosEspecialistas
