import Avatar from '../../components/Avatar'
import TriagePriorityBadge from './TriagePriorityBadge'
import type { Ticket } from '../../types/ticket'

interface AgentActivityPanelProps {
  title: string
  tickets: Ticket[]
  showPriority: boolean
  emptyMessage: string
}

// REQUIREMENTS.md — Dashboard resumen: "Nivel 1 · En Gestión" / "Nivel 2 · En Curso". Una
// fila por agente con ticket activo ahora mismo — no una cola completa ni una lista de
// agentes "disponibles". Sin contador tipo "2/2" junto al título ni pie de panel con
// conteos (ambos descartados explícitamente). Tamaño compacto (CORRECCIÓN): ticket ID
// ~18-20px, asunto ~14-15px en peso regular (no negrita), avatar+nombre y metadatos
// ~12-13px — el padding/espaciado también se redujo para que cada tarjeta ocupe menos
// alto, no solo el texto. Fondo de cada tarjeta un tono más claro que el panel
// (`bg-white/5` sobre el mismo azul, no un color nuevo) para distinguirse como tarjeta
// propia, no solo una fila separada por línea. Orden (CORRECCIÓN): ticket → asunto →
// avatar+nombre (abajo, sin línea de metadatos de tiempo). En Nivel 2, el badge de
// prioridad se ubica junto a la fila de avatar/nombre.
function AgentActivityPanel({ title, tickets, showPriority, emptyMessage }: AgentActivityPanelProps) {
  return (
    <div className="flex flex-col rounded-lg bg-[#1E2150]">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        {tickets.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">{emptyMessage}</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-md border border-white/10 bg-white/5 p-2.5"
            >
              <p className="truncate text-lg font-bold text-white">{ticket.id}</p>
              <p className="truncate text-sm font-normal text-slate-100">{ticket.titulo}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  {ticket.responsable && (
                    <Avatar
                      nombre={ticket.responsable.nombre}
                      avatarUrl={ticket.responsable.avatarUrl}
                    />
                  )}
                  <span className="truncate text-xs font-medium text-indigo-200">
                    {ticket.responsable?.nombre ?? 'Sin responsable'}
                  </span>
                </div>
                {showPriority && ticket.prioridad && (
                  <TriagePriorityBadge prioridad={ticket.prioridad} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AgentActivityPanel
