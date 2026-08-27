import { useMemo, useState } from 'react'
import AgentColumn from '../../components/AgentColumn'
import SearchBar from '../../components/SearchBar'
import { useSearch } from '../../hooks/useSearch'
import { MOCK_TICKETS } from '../../lib/mockTickets'
import type { Ticket, TicketStatus } from '../../types/ticket'

// "En espera" queda fuera de esta vista por definición (sin agente asignado) —
// REQUIREMENTS.md §5 "Vista kanban por agente en Nivel 1 – Revisión". Sigue visible
// solo en el Tablero general hasta que un agente lo toma.
const NIVEL1_ESTADOS: TicketStatus[] = ['En revisión N1', 'En validación']

function getAsignacionKey(ticket: Ticket): number {
  // "Hora de asignación al agente" = cuándo entró al estado actual (primera revisión
  // o retorno para validación); ambos casos tienen entrada de historial porque ya
  // pasaron por "En espera" antes de llegar aquí.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

function NivelUnoRevision() {
  const nivelUnoTickets = MOCK_TICKETS.filter(
    (ticket): ticket is Ticket & { responsable: NonNullable<Ticket['responsable']> } =>
      NIVEL1_ESTADOS.includes(ticket.estado) && Boolean(ticket.responsable),
  )
  const { query, setQuery, matchedIds, resultCount } = useSearch(nivelUnoTickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? nivelUnoTickets.filter((ticket) => matchedIds.has(ticket.id))
    : nivelUnoTickets

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
        tickets: [...tickets].sort((a, b) => getAsignacionKey(a) - getAsignacionKey(b)),
      }))
      .sort((a, b) => a.agente.localeCompare(b.agente))
  }, [visibleTickets])

  return (
    <div className="bg-fondo p-6">
      <div className="mb-4 flex items-center gap-2">
        <h1 className="text-sm font-semibold text-navy">Todos los casos</h1>
        <span className="rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
          {nivelUnoTickets.length}
        </span>
      </div>

      <div className="mb-4">
        <SearchBar query={query} onQueryChange={setQuery} resultCount={resultCount} />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {columnas.map(({ agente, tickets }) => (
          <AgentColumn
            key={agente}
            agentName={agente}
            tickets={tickets}
            matchedIds={matchedIds}
            expandedTicketId={expandedTicketId}
            onToggleTicketDetail={(ticketId) =>
              setExpandedTicketId((current) => (current === ticketId ? null : ticketId))
            }
          />
        ))}
      </div>
    </div>
  )
}

export default NivelUnoRevision
