import Avatar from './Avatar'
import LevelBadge from './LevelBadge'
import PendienteClienteAlertCard from './PendienteClienteAlertCard'
import TicketHistoryTimeline from './TicketHistoryTimeline'
import TimeElapsedCard from './TimeElapsedCard'
import { formatDuration } from '../lib/time'
import type { Ticket } from '../types/ticket'

interface TicketDetailPanelProps {
  ticket: Ticket
}

function TicketDetailPanel({ ticket }: TicketDetailPanelProps) {
  const estadoActualDesde = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  // "Tiempo en estado actual" y "tiempo sin respuesta" son el mismo dato para un
  // ticket "Pendiente cliente" (REQUIREMENTS.md §6): mismo cálculo. Para ese estado, la
  // segunda tarjeta se reemplaza por la alerta escalonada de REQUIREMENTS.md §5.
  const isPendienteCliente = ticket.estado === 'Pendiente cliente'

  return (
    <div className="flex flex-col gap-3">
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
        {ticket.historial && ticket.historial.length > 0 ? (
          <TicketHistoryTimeline historial={ticket.historial} />
        ) : (
          <p className="text-xs text-gray-400">Historial no disponible</p>
        )}
      </div>
    </div>
  )
}

export default TicketDetailPanel
