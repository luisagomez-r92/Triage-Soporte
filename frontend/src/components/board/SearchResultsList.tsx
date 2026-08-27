import type { Ticket } from '../../types/ticket'

interface SearchResultsListProps {
  results: { ticket: Ticket; columnTitle: string }[]
}

function SearchResultsList({ results }: SearchResultsListProps) {
  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
        Sin resultados
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
      {results.map(({ ticket, columnTitle }) => (
        <div
          key={ticket.id}
          className="flex items-center justify-between gap-3 px-4 py-2 text-sm"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono font-semibold text-navy">{ticket.id}</span>
            <span className="text-gray-600">{ticket.solicitante}</span>
          </div>
          <span className="whitespace-nowrap rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
            {columnTitle}
          </span>
        </div>
      ))}
    </div>
  )
}

export default SearchResultsList
