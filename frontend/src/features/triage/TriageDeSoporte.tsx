import AgentActivityPanel from './AgentActivityPanel'
import TriagePriorityBadge from './TriagePriorityBadge'
import UpcomingList from './UpcomingList'
import LastUpdatedIndicator from '../../components/LastUpdatedIndicator'
import { compararPorRank, getAsignacionKey } from '../../hooks/useN2PositionBadges'
import type { Ticket } from '../../types/ticket'

interface TriageDeSoporteProps {
  tickets: Ticket[]
  loading: boolean
  error: string | null
  isRefreshing: boolean
  refreshError: string | null
  lastUpdatedAt: number | null
  refetch: () => void
}

// REQUIREMENTS.md — "Dashboard resumen — 'Triage de Soporte' (nueva vista)": resumen
// ejecutivo, mismos datos del polling que ya alimentan "Tablero" (se reciben por props
// desde App.tsx, no hay fuente aparte). El tema oscuro es exclusivo de los 2 paneles
// superiores — la página en sí y las listas "Próximos" son de tema claro, igual que el
// resto de la app.
function TriageDeSoporte({
  tickets,
  loading,
  error,
  isRefreshing,
  refreshError,
  lastUpdatedAt,
  refetch,
}: TriageDeSoporteProps) {
  const n1EnGestion = tickets
    .filter((ticket) => ticket.estado === 'En revisión N1')
    .sort((a, b) => getAsignacionKey(a) - getAsignacionKey(b))

  const n2EnCurso = tickets
    .filter((ticket) => ticket.estado === 'En curso N2')
    .sort((a, b) => getAsignacionKey(a) - getAsignacionKey(b))

  const proximosN1 = tickets
    .filter((ticket) => ticket.estado === 'En espera')
    .sort((a, b) => new Date(a.creadoEn).getTime() - new Date(b.creadoEn).getTime())

  const proximosN2 = tickets
    .filter((ticket) => ticket.estado === 'Escalado a N2')
    .sort(compararPorRank)

  return (
    <div className="min-h-full bg-white p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold text-navy">Triage de Soporte</h1>
        <LastUpdatedIndicator
          lastUpdatedAt={lastUpdatedAt}
          isRefreshing={isRefreshing}
          refreshError={refreshError}
        />
      </div>

      {loading && <p className="text-sm text-gray-500">Cargando tickets desde Jira…</p>}

      {!loading && error && (
        <div className="rounded-lg border border-naranja/30 bg-naranja/10 px-4 py-3 text-sm text-naranja">
          <p className="font-medium">No se pudieron cargar los tickets desde Jira.</p>
          <p className="mt-1 text-xs">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-3 rounded-full border border-naranja px-3 py-1 text-xs font-medium hover:bg-naranja/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <AgentActivityPanel
              title="Nivel 1 · En Gestión"
              tickets={n1EnGestion}
              showPriority={false}
              emptyMessage="Nadie en gestión en este momento"
            />
            <AgentActivityPanel
              title="Nivel 2 · En Curso"
              tickets={n2EnCurso}
              showPriority
              emptyMessage="Nadie con ticket en curso en este momento"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <UpcomingList
              title="Próximos · Nivel 1"
              tickets={proximosN1}
              emptyMessage="Sin tickets en espera"
              renderTrailing={(ticket) => (
                <span className="max-w-[160px] truncate text-xs text-gray-500">
                  {ticket.solicitante}
                </span>
              )}
            />
            <UpcomingList
              title="Próximos · Nivel 2"
              tickets={proximosN2}
              emptyMessage="Sin tickets escalados en cola"
              renderTrailing={(ticket) =>
                ticket.prioridad ? (
                  <TriagePriorityBadge prioridad={ticket.prioridad} variant="light" />
                ) : null
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default TriageDeSoporte
