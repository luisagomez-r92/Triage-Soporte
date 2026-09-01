import { useMemo, useState } from 'react'
import SearchBar from '../../components/SearchBar'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketListColumn from '../../components/TicketListColumn'
import { useSearch } from '../../hooks/useSearch'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { Ticket, TicketStatus } from '../../types/ticket'

// El criterio de esta vista es tener agente asignado, no un estado específico
// (REQUIREMENTS.md §4/§5): un "En espera" ya asignado en Jira SÍ aparece en la columna
// de su agente, aunque conserve el estado "En espera" (sin historial ni botón "Ver
// detalle" — eso sigue dependiendo del estado, sección 6). Solo los "En espera" sin
// agente asignado quedan fuera, visibles únicamente en el Tablero general.
const NIVEL1_ESTADOS: TicketStatus[] = ['En espera', 'En revisión N1', 'En validación']

function getAsignacionKey(ticket: Ticket): number {
  // "Hora de asignación al agente" = cuándo entró al estado actual (primera revisión o
  // retorno para validación), tomado del historial. Los "En espera" ya asignados no
  // tienen historial (regla de negocio) ni una hora de asignación exacta en Jira sin el
  // changelog (diferido) — se usa la hora de creación como aproximación mientras tanto.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

interface NivelUnoRevisionProps {
  tickets: Ticket[]
}

function NivelUnoRevision({ tickets }: NivelUnoRevisionProps) {
  const nivelUnoTickets = tickets.filter(
    (ticket): ticket is Ticket & { responsable: NonNullable<Ticket['responsable']> } =>
      NIVEL1_ESTADOS.includes(ticket.estado) && Boolean(ticket.responsable),
  )
  const { query, setQuery, matchedIds, resultCount } = useSearch(nivelUnoTickets)
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
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
    <div className="bg-white p-6">
      <div className="mb-4">
        <SearchBar
          totalCount={nivelUnoTickets.length}
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
