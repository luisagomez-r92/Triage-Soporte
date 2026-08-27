import { useEffect } from 'react'
import ProgressBar from '../ProgressBar'
import StatusChip from '../StatusChip'
import TicketDetailPanel from '../TicketDetailPanel'
import { PROGRESS_BY_STATUS } from '../../lib/ticketProgress'
import type { Ticket } from '../../types/ticket'

interface TicketDetailModalProps {
  ticket: Ticket
  onClose: () => void
}

function TicketDetailModal({ ticket, onClose }: TicketDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-lg font-semibold text-navy">{ticket.id}</p>
            <p className="text-sm text-gray-600">{ticket.solicitante}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusChip estado={ticket.estado} />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="text-gray-400 hover:text-navy"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar percent={PROGRESS_BY_STATUS[ticket.estado]} />
        </div>

        <div className="mt-4">
          <TicketDetailPanel ticket={ticket} />
        </div>
      </div>
    </div>
  )
}

export default TicketDetailModal
