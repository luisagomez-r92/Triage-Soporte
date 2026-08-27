import type { KeyboardEvent } from 'react'
import Avatar from '../Avatar'
import StatusChip from '../StatusChip'
import TicketDetailPanel from '../TicketDetailPanel'
import TicketValidationAlert from '../TicketValidationAlert'
import type { Ticket } from '../../types/ticket'

const LEFT_BORDER_BY_STATUS: Partial<Record<Ticket['estado'], string>> = {
  'En validación': 'border-l-verde',
  'En curso N2': 'border-l-accent',
}

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
}

function TicketCard({ ticket, matchState, detailTrigger }: TicketCardProps) {
  const leftBorder = LEFT_BORDER_BY_STATUS[ticket.estado] ?? 'border-l-transparent'
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
      role={isCardClickable ? 'button' : undefined}
      tabIndex={isCardClickable ? 0 : undefined}
      onClick={isCardClickable ? () => detailTrigger.onOpenDetail(ticket) : undefined}
      onKeyDown={isCardClickable ? handleCardKeyDown : undefined}
      className={`rounded-lg border border-l-4 border-gray-200 bg-white p-3 transition-opacity ${leftBorder} ${searchClasses} ${
        isCardClickable ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-sm font-semibold text-navy">
          {ticket.id}
        </span>
        <StatusChip estado={ticket.estado} />
      </div>
      <p className="mt-1 text-sm text-gray-600">{ticket.solicitante}</p>
      <div className="mt-3 flex items-center justify-between">
        {ticket.responsable ? (
          <div className="flex items-center gap-1.5">
            <Avatar
              nombre={ticket.responsable.nombre}
              avatarUrl={ticket.responsable.avatarUrl}
            />
            <span className="text-xs text-gray-500">
              {ticket.responsable.nombre}
            </span>
          </div>
        ) : (
          <span />
        )}
        {puedeVerDetalle && isModalTrigger && (
          <span className="text-xs font-medium text-accent">Ver detalle</span>
        )}
        {puedeVerDetalle && !isModalTrigger && (
          <button
            type="button"
            onClick={() => detailTrigger.onToggle()}
            className="text-xs font-medium text-accent hover:underline"
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
