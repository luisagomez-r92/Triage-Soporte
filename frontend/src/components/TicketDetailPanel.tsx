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

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <TimeElapsedCard label="Tiempo total" value={formatDuration(ticket.creadoEn)} />
        <TimeElapsedCard
          label="Tiempo en estado actual"
          value={formatDuration(estadoActualDesde)}
        />
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
