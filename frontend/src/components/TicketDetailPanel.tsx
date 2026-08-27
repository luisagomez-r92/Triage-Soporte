import Avatar from './Avatar'
import LevelBadge from './LevelBadge'
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
  // ticket "Pendiente cliente" (REQUIREMENTS.md §6): mismo cálculo, etiqueta más clara.
  const estadoActualLabel =
    ticket.estado === 'Pendiente cliente' ? 'Sin respuesta' : 'Tiempo en estado actual'

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TimeElapsedCard label="Tiempo total" value={formatDuration(ticket.creadoEn)} />
        <TimeElapsedCard label={estadoActualLabel} value={formatDuration(estadoActualDesde)} />
      </div>

      {ticket.responsable && (
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3">
          <Avatar
            nombre={ticket.responsable.nombre}
            avatarUrl={ticket.responsable.avatarUrl}
          />
          <span className="text-sm text-navy">{ticket.responsable.nombre}</span>
          <LevelBadge nivel={ticket.responsable.nivel} />
        </div>
      )}

      {ticket.historial && ticket.historial.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Historial
          </h3>
          <TicketHistoryTimeline historial={ticket.historial} />
        </div>
      )}
    </div>
  )
}

export default TicketDetailPanel
