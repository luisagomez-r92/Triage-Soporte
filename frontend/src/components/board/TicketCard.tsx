import type { KeyboardEvent } from 'react'
import Avatar from '../Avatar'
import ProgressRing from '../ProgressRing'
import StatusChip from '../StatusChip'
import TicketDetailPanel from '../TicketDetailPanel'
import TicketValidationAlert from '../TicketValidationAlert'
import TicketWaitingTime from '../TicketWaitingTime'
import { getLeftBorderClass } from '../../lib/ticketBorderColor'
import { PROGRESS_BY_STATUS } from '../../lib/ticketProgress'
import type { Ticket } from '../../types/ticket'

// 'modal': click en toda la tarjeta abre el modal de detalle (Tablero general).
// 'panel': solo el botón "Ver detalle" expande un panel inline (N1/N2/Pendiente) —
// sección 5 ("Panel de detalle desplegable").
type DetailTrigger =
  | { mode: 'modal'; onOpenDetail: (ticket: Ticket) => void }
  | { mode: 'panel'; expanded: boolean; onToggle: () => void }

interface TicketCardProps {
  ticket: Ticket
  matchState?: 'match' | 'dimmed'
  detailTrigger: DetailTrigger
  // Posición del ticket dentro de la cola de su responsable (REQUIREMENTS.md §4/§5) —
  // solo llega poblado para tickets "Escalado a N2"/"En curso N2".
  positionBadge?: number
}

function TicketCard({ ticket, matchState, detailTrigger, positionBadge }: TicketCardProps) {
  const leftBorder = getLeftBorderClass(ticket.estado)
  // Regla de negocio (REQUIREMENTS.md §6): "En espera" no tiene historial ni puede
  // abrir ningún detalle (ni modal ni panel).
  const puedeVerDetalle = ticket.estado !== 'En espera'
  const searchClasses =
    matchState === 'dimmed'
      ? 'opacity-40'
      : matchState === 'match'
        ? 'ring-2 ring-accent'
        : ''

  const isModalTrigger = detailTrigger.mode === 'modal'
  const isCardClickable = isModalTrigger && puedeVerDetalle

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isModalTrigger) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      detailTrigger.onOpenDetail(ticket)
    }
  }

  return (
    <div
      data-ticket-id={ticket.id}
      role={isCardClickable ? 'button' : undefined}
      tabIndex={isCardClickable ? 0 : undefined}
      onClick={isCardClickable ? () => detailTrigger.onOpenDetail(ticket) : undefined}
      onKeyDown={isCardClickable ? handleCardKeyDown : undefined}
      className={`rounded-lg border border-l-4 border-gray-300 bg-fondo p-3 shadow-sm transition-opacity ${leftBorder} ${searchClasses} ${
        isCardClickable ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <ProgressRing percent={PROGRESS_BY_STATUS[ticket.estado]} />
          <span className="truncate font-mono text-xs font-semibold text-navy">
            {ticket.id}
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          <StatusChip estado={ticket.estado} size="compact" />
        </div>
      </div>
      <p className="mt-1 line-clamp-2 break-words text-sm font-semibold text-navy">{ticket.titulo}</p>
      <p className="mt-0.5 line-clamp-2 break-words text-xs text-gray-600">{ticket.solicitante}</p>
      {ticket.estado === 'Pendiente cliente' && (
        <div className="mt-1">
          <TicketWaitingTime ticket={ticket} />
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
            <span className="truncate text-xs text-gray-500">
              {ticket.responsable.nombre}
            </span>
          </div>
        ) : (
          <span />
        )}
        {puedeVerDetalle && isModalTrigger && (
          <span className="flex-shrink-0 text-xs font-medium text-accent">Ver detalle</span>
        )}
        {puedeVerDetalle && !isModalTrigger && (
          <button
            type="button"
            onClick={() => detailTrigger.onToggle()}
            className="flex-shrink-0 text-xs font-medium text-accent hover:underline"
          >
            {detailTrigger.expanded ? 'Ocultar detalle' : 'Ver detalle'}
          </button>
        )}
      </div>

      {!isModalTrigger && puedeVerDetalle && detailTrigger.expanded && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {ticket.estado === 'En validación' && <TicketValidationAlert />}
          <TicketDetailPanel ticket={ticket} />
        </div>
      )}
    </div>
  )
}

export default TicketCard
