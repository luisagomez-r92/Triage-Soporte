import { getPendienteClienteAlert } from '../lib/pendienteClienteAlert'
import { formatDuration } from '../lib/time'
import type { Ticket } from '../types/ticket'

interface TicketWaitingTimeProps {
  ticket: Ticket
}

function TicketWaitingTime({ ticket }: TicketWaitingTimeProps) {
  const pendienteDesde = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  const alert = getPendienteClienteAlert(pendienteDesde)

  return (
    <div>
      <p className={`text-xs ${alert.colorClass} ${alert.bold ? 'font-bold' : 'font-medium'}`}>
        {alert.showIcon && <span aria-hidden="true">⚠️ </span>}
        Sin respuesta: {formatDuration(pendienteDesde)}
        {alert.showClosingSoonBadge && <span> · Se cierra pronto</span>}
      </p>
      <p
        className={`text-[11px] ${alert.isOverdue ? 'font-semibold text-rojo-alerta' : 'text-gray-400'}`}
      >
        {alert.countdownLabel}
      </p>
    </div>
  )
}

export default TicketWaitingTime
