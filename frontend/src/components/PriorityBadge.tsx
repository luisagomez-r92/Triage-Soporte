import type { TicketPriority } from '../types/ticket'

interface PriorityBadgeProps {
  prioridad: TicketPriority
}

function PriorityBadge({ prioridad }: PriorityBadgeProps) {
  return (
    <span className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      {prioridad}
    </span>
  )
}

export default PriorityBadge
