import { useMemo, useState } from 'react'
import CountryFilter from '../../components/CountryFilter'
import SearchBar from '../../components/SearchBar'
import SearchResultNavigator from '../../components/SearchResultNavigator'
import SearchStatusMessage from '../../components/SearchStatusMessage'
import TicketListColumn from '../../components/TicketListColumn'
import { compararPorRank, getAsignacionKey, useN2PositionBadges } from '../../hooks/useN2PositionBadges'
import { useSearch } from '../../hooks/useSearch'
import { useSearchResultNavigation } from '../../hooks/useSearchResultNavigation'
import { useTicketSearchMessage } from '../../hooks/useTicketSearchMessage'
import type { PaisFiltro, Ticket, TicketStatus } from '../../types/ticket'

// REQUIREMENTS.md §5 "Vista kanban por agente en Nivel 2 – Especialistas" — reemplaza las
// columnas fijas "Escalados"/"En curso". Todo ticket en estos estados ya tiene especialista
// asignado en Jira desde el escalado, así que el filtro de responsable es solo para
// estrechar el tipo (nunca debería excluir nada en la práctica).
const NIVEL2_ESTADOS: TicketStatus[] = ['Escalado a N2', 'En curso N2']

// REQUIREMENTS.md §4/§5 "Orden dentro de cada columna": En curso primero (si tiene, por
// hora en que lo tomó), luego Escalados por Rank de Jira. Esto establece el orden visual
// — es independiente del conteo del badge de posición (useN2PositionBadges), que solo
// recorre esa lista ya ordenada, no decide el orden por su cuenta.
function compararOrdenColumna(a: Ticket, b: Ticket): number {
  const aEnCurso = a.estado === 'En curso N2'
  const bEnCurso = b.estado === 'En curso N2'
  if (aEnCurso !== bEnCurso) return aEnCurso ? -1 : 1
  return aEnCurso ? getAsignacionKey(a) - getAsignacionKey(b) : compararPorRank(a, b)
}

interface NivelDosEspecialistasProps {
  tickets: Ticket[]
  pais: PaisFiltro
  onPaisChange: (pais: PaisFiltro) => void
}

function NivelDosEspecialistas({ tickets, pais, onPaisChange }: NivelDosEspecialistasProps) {
  // REQUIREMENTS.md §5 "Filtro de país 'Ubicado en'" — primer paso, antes de agrupar por
  // agente: un ticket que no corresponda al país elegido no aparece en ninguna columna.
  const ticketsPais = pais === 'Todos' ? tickets : tickets.filter((ticket) => ticket.pais === pais)

  const nivel2Tickets = ticketsPais.filter(
    (ticket): ticket is Ticket & { responsable: NonNullable<Ticket['responsable']> } =>
      NIVEL2_ESTADOS.includes(ticket.estado) && Boolean(ticket.responsable),
  )
  const { query, setQuery, matchedIds, resultCount } = useSearch(nivel2Tickets)
  const { message: searchMessage } = useTicketSearchMessage(query, resultCount, tickets)
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null)

  const visibleTickets = matchedIds
    ? nivel2Tickets.filter((ticket) => matchedIds.has(ticket.id))
    : nivel2Tickets

  // Orden visual de cada columna (REQUIREMENTS.md §4/§5): en curso primero, luego
  // escalados por Rank — independiente y anterior al cálculo del badge.
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
        tickets: [...tickets].sort(compararOrdenColumna),
      }))
      .sort((a, b) => a.agente.localeCompare(b.agente))
  }, [visibleTickets])

  // Badge de posición por persona (REQUIREMENTS.md §5) — CORRECCIÓN: se le pasa la lista
  // ya ordenada de `columnas` (arriba), concatenada en el mismo orden columna por
  // columna en que se renderiza; el hook solo cuenta por persona sobre ese recorrido, no
  // reordena nada por su cuenta. Mismo hook compartido que usa la columna Nivel 2 del
  // Tablero general.
  const ticketsEnOrdenVisual = useMemo(
    () => columnas.flatMap(({ tickets }) => tickets),
    [columnas],
  )
  const posicionPorTicket = useN2PositionBadges(ticketsEnOrdenVisual)
  const getPositionBadge = (ticket: Ticket) => posicionPorTicket.get(ticket.id)

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
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <SearchBar
            totalCount={nivel2Tickets.length}
            query={query}
            onQueryChange={setQuery}
            resultCount={resultCount}
          />
        </div>
        <CountryFilter value={pais} onChange={onPaisChange} />
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
