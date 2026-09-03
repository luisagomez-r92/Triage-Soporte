import type { ReactNode } from 'react'
import type { Ticket } from '../../types/ticket'

interface UpcomingListProps {
  title: string
  tickets: Ticket[]
  emptyMessage: string
  // Contenido a la derecha de cada fila, ya con su propio estilo (span de solicitante o
  // TriagePriorityBadge) — este componente no le impone color, solo la posición.
  renderTrailing: (ticket: Ticket) => ReactNode
}

// REQUIREMENTS.md — Dashboard resumen: "Próximos · Nivel 1"/"Próximos · Nivel 2". Tema
// CLARO (a diferencia de los 2 paneles de arriba) — círculo navy con número blanco,
// ticket+asunto en negrita sobre la misma línea, y a la derecha el dato variable (solo,
// sin línea de tiempo debajo — CORRECCIÓN, se eliminó). Numeración secuencial simple
// (1, 2, 3...), NO el badge de posición por persona (ese es exclusivo de Nivel 2 –
// Especialistas, sección 5).
function UpcomingList({ title, tickets, emptyMessage, renderTrailing }: UpcomingListProps) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
      </div>

      <div className="flex flex-1 flex-col">
        {tickets.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-gray-400">{emptyMessage}</p>
        ) : (
          tickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 last:border-0"
            >
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-white">
                {index + 1}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                <span className="font-mono">{ticket.id}</span> · {ticket.titulo}
              </p>
              <div className="flex-shrink-0 text-right">{renderTrailing(ticket)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UpcomingList
