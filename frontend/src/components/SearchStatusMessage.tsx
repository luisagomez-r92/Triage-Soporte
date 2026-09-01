import type { TicketSearchMessage } from '../hooks/useTicketSearchMessage'

interface SearchStatusMessageProps {
  message: TicketSearchMessage | null
}

// REQUIREMENTS.md §5 "Mensajes de búsqueda según estado del ticket": reemplaza el
// genérico "0 resultados" con un mensaje que distingue por qué no aparece.
function SearchStatusMessage({ message }: SearchStatusMessageProps) {
  if (!message) return null

  if (message.kind === 'other-tab') {
    return (
      <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-navy">
        Este caso está abierto, pero en <span className="font-semibold">{message.tabLabel}</span>
      </div>
    )
  }

  if (message.kind === 'closed') {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
        Este caso ya fue cerrado y no aparece en el tablero
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
      Sin resultados
    </div>
  )
}

export default SearchStatusMessage
