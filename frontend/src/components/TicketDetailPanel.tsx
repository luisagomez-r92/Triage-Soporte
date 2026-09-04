import Avatar from './Avatar'
import LevelBadge from './LevelBadge'
import PendienteClienteAlertCard from './PendienteClienteAlertCard'
import ProgressBar from './ProgressBar'
import TicketHistoryTimeline from './TicketHistoryTimeline'
import TimeElapsedCard from './TimeElapsedCard'
import { useTicketHistory } from '../hooks/useTicketHistory'
import { formatDuration } from '../lib/time'
import { PROGRESS_BY_STATUS } from '../lib/ticketProgress'
import type { Ticket } from '../types/ticket'

interface TicketDetailPanelProps {
  ticket: Ticket
  // La tarjeta de lista (TicketListCard) ya muestra su propia barra de progreso siempre
  // visible — pasar false evita duplicarla al expandir "Ver detalle" (REQUIREMENTS.md §5,
  // "una sola vez por tarjeta/panel"). El Modal de detalle no tiene barra propia, así que
  // ahí se deja en true (default).
  showProgress?: boolean
}

function TicketDetailPanel({ ticket, showProgress = true }: TicketDetailPanelProps) {
  // Bajo demanda: este componente solo se monta cuando el Modal o el Panel desplegable
  // están abiertos, así que el fetch ocurre exactamente en ese momento — no antes, no
  // como parte del polling de useTickets (REQUIREMENTS.md §9).
  const { historial, loading: historialLoading, error: historialError } = useTicketHistory(
    ticket.id,
  )
  const estadoActualDesde = historial?.at(-1)?.fecha ?? ticket.creadoEn
  // "Tiempo en estado actual" y "tiempo sin respuesta" son el mismo dato para un
  // ticket "Pendiente cliente" (REQUIREMENTS.md §6): mismo cálculo. Para ese estado, la
  // segunda tarjeta se reemplaza por la alerta escalonada de REQUIREMENTS.md §5.
  const isPendienteCliente = ticket.estado === 'Pendiente cliente'

  return (
    <div className="flex flex-col gap-3">
      {showProgress && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <ProgressBar percent={PROGRESS_BY_STATUS[ticket.estado]} />
          </div>
          <span className="text-xs text-gray-400">{PROGRESS_BY_STATUS[ticket.estado]}%</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <TimeElapsedCard label="Tiempo total" value={formatDuration(ticket.creadoEn)} />
        {isPendienteCliente ? (
          <PendienteClienteAlertCard pendienteDesde={estadoActualDesde} />
        ) : (
          <TimeElapsedCard
            label="Tiempo en estado actual"
            value={formatDuration(estadoActualDesde)}
          />
        )}
      </div>

      {ticket.responsable && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
          <Avatar
            nombre={ticket.responsable.nombre}
            avatarUrl={ticket.responsable.avatarUrl}
          />
          <span className="text-sm text-navy">{ticket.responsable.nombre}</span>
          {ticket.responsable.nivel && <LevelBadge nivel={ticket.responsable.nivel} />}
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Historial
        </h3>
        {historialLoading ? (
          <p className="text-xs text-gray-400">Cargando historial…</p>
        ) : !historialError && historial && historial.length > 0 ? (
          <TicketHistoryTimeline historial={historial} />
        ) : (
          <p className="text-xs text-gray-400">Historial no disponible</p>
        )}
      </div>
    </div>
  )
}

export default TicketDetailPanel
