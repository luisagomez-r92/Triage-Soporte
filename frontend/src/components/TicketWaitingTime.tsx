import { formatDuration } from '../lib/time'
import type { Ticket } from '../types/ticket'

interface TicketWaitingTimeProps {
  ticket: Ticket
}

function TicketWaitingTime({ ticket }: TicketWaitingTimeProps) {
  const pendienteDesde = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn

  return (
    <p className="text-xs font-medium text-naranja">
      Sin respuesta: {formatDuration(pendienteDesde)}
    </p>
  )
}

export default TicketWaitingTime
