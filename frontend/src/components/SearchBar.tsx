interface SearchBarProps {
  query: string
  onQueryChange: (value: string) => void
  resultCount: number | null
}

function SearchBar({ query, onQueryChange, resultCount }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Buscar por número de ticket (FK-XXXX) o nombre del solicitante"
        className="w-full max-w-md rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-navy placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {resultCount !== null && (
        <span className="whitespace-nowrap text-sm text-gray-500">
          {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
        </span>
      )}
    </div>
  )
}

export default SearchBar
