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
  // Posición del ticket dentro de la cola de su responsable (REQUIREMENTS.md §5) — solo
  // llega poblado desde las columnas por agente de Nivel 2 – Especialistas.
  positionBadge?: number
  // 'discreet' (default) para N1/Pendiente. Nivel 2 – Especialistas pasa 'solid' — mismo
  // chip píldora con fondo de color que usa TicketCard del Tablero general, ya que ahí no
  // hay columnas separadas por estado que lo indiquen de un vistazo (REQUIREMENTS.md §5).
  statusChipVariant?: 'solid' | 'discreet'
}

function TicketListCard({
  ticket,
  expanded,
  onToggle,
  positionBadge,
  statusChipVariant = 'discreet',
}: TicketListCardProps) {
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
      data-ticket-id={ticket.id}
      className={`rounded-lg border border-l-4 border-gray-300 bg-fondo p-4 shadow-sm ${getLeftBorderClass(
        ticket.estado,
      )}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-gray-400">{metaLine}</p>
        {statusChipVariant === 'solid' && (
          <StatusChip estado={ticket.estado} variant="solid" />
        )}
      </div>
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

      {statusChipVariant === 'discreet' && (
        <div className="mt-3 flex items-center gap-2">
          <StatusChip estado={ticket.estado} variant="discreet" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {ticket.responsable ? (
          <div className="flex min-w-0 items-center gap-1.5">
            <div className="relative flex-shrink-0">
              <Avatar
                nombre={ticket.responsable.nombre}
                avatarUrl={ticket.responsable.avatarUrl}
              />
              {positionBadge !== undefined && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white ring-2 ring-fondo">
                  {positionBadge}
                </span>
              )}
            </div>
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
          <TicketDetailPanel ticket={ticket} showProgress={false} />
        </div>
      )}
    </div>
  )
}

export default TicketListCard
