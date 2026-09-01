import Avatar from './Avatar'
import ProgressBar from './ProgressBar'
import StatusChip from './StatusChip'
import TicketDetailPanel from './TicketDetailPanel'
import TicketValidationAlert from './TicketValidationAlert'
import TicketWaitingTime from './TicketWaitingTime'
import { getLeftBorderClass } from '../lib/ticketBorderColor'
import { PROGRESS_BY_STATUS } from '../lib/ticketProgress'
import { formatTime } from '../lib/time'
import type { Ticket } from '../types/ticket'

interface TicketListCardProps {
  ticket: Ticket
  expanded: boolean
  onToggle: () => void
}

function TicketListCard({ ticket, expanded, onToggle }: TicketListCardProps) {
  // Regla de negocio (REQUIREMENTS.md §6): "En espera" no tiene historial ni botón
  // "Ver detalle" — tampoco tiene hora de "tomado" porque no está asignado.
  const puedeVerDetalle = ticket.estado !== 'En espera'
  const tomadoFecha = ticket.historial?.at(-1)?.fecha
  const metaLine = [
    ticket.id,
    formatTime(ticket.creadoEn),
    tomadoFecha ? `tomado ${formatTime(tomadoFecha)}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const percent = PROGRESS_BY_STATUS[ticket.estado]

  return (
    <div
      className={`rounded-lg border border-l-4 border-gray-300 bg-fondo p-4 shadow-sm ${getLeftBorderClass(
        ticket.estado,
      )}`}
    >
      <p className="truncate text-xs text-gray-400">{metaLine}</p>
      <p className="mt-1 line-clamp-2 break-words text-sm font-semibold text-navy">{ticket.titulo}</p>
      <p className="mt-0.5 line-clamp-2 break-words text-xs text-gray-600">
        {ticket.solicitante}
        {ticket.empresa && ` - ${ticket.empresa}`}
      </p>

      {ticket.estado === 'Pendiente cliente' && (
        <div className="mt-1">
          <TicketWaitingTime ticket={ticket} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1">
          <ProgressBar percent={percent} />
        </div>
        <span className="text-xs text-gray-400">{percent}%</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <StatusChip estado={ticket.estado} variant="discreet" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        {ticket.responsable ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar
              nombre={ticket.responsable.nombre}
              avatarUrl={ticket.responsable.avatarUrl}
            />
            <span className="truncate text-xs text-gray-500">{ticket.responsable.nombre}</span>
          </div>
        ) : (
          <span />
        )}
        {puedeVerDetalle && (
          <button
            type="button"
            onClick={onToggle}
            className="flex-shrink-0 rounded-full border border-accent px-3 py-1 text-xs font-medium text-accent hover:bg-accent/5"
          >
            {expanded ? 'Ocultar detalle' : 'Ver detalle'}
          </button>
        )}
      </div>

      {puedeVerDetalle && expanded && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {ticket.estado === 'En validación' && <TicketValidationAlert />}
          <TicketDetailPanel ticket={ticket} />
        </div>
      )}
    </div>
  )
}

export default TicketListCard
