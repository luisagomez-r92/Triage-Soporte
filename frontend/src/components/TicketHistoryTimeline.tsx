import { formatDateTime } from '../lib/time'
import type { TicketHistoryEntry } from '../types/ticket'

interface TicketHistoryTimelineProps {
  historial: TicketHistoryEntry[]
}

function TicketHistoryTimeline({ historial }: TicketHistoryTimelineProps) {
  return (
    <ol className="border-l-2 border-gray-200 pl-4">
      {historial.map((entry, index) => {
        const isCurrent = index === historial.length - 1

        return (
          <li key={`${entry.estado}-${entry.fecha}`} className="relative pb-4 last:pb-0">
            <span
              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ${
                isCurrent ? 'bg-accent' : 'bg-gray-300'
              }`}
            />
            <p className="text-sm font-medium text-navy">{entry.estado}</p>
            <p className="text-xs text-gray-500">{formatDateTime(entry.fecha)}</p>
          </li>
        )
      })}
    </ol>
  )
}

export default TicketHistoryTimeline
