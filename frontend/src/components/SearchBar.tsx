interface SearchBarProps {
  totalCount: number
  query: string
  onQueryChange: (value: string) => void
  resultCount: number | null
}

// Contador "Todos los casos [N]" + buscador como un solo bloque visual (REQUIREMENTS.md
// §5): borde redondeado envolviendo ambos, con un divisor vertical sutil entre ellos —
// no dos elementos sueltos. Antes vivían por separado, duplicados en cada una de las 4
// pestañas; ahora un solo componente los arma juntos.
function SearchBar({ totalCount, query, onQueryChange, resultCount }: SearchBarProps) {
  return (
    <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex flex-shrink-0 items-center gap-2 px-4 py-2.5">
        <span className="text-sm font-semibold text-navy">Todos los casos</span>
        <span className="rounded-full bg-lavanda px-2 py-0.5 text-xs font-medium text-navy">
          {totalCount}
        </span>
      </div>
      <div className="w-px flex-shrink-0 bg-gray-200" />
      <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar por número de ticket (ST-XXXX) o nombre del solicitante"
          className="w-full max-w-md text-sm text-navy placeholder:text-gray-400 focus:outline-none"
        />
        {resultCount !== null && (
          <span className="whitespace-nowrap text-sm text-gray-500">
            {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
          </span>
        )}
      </div>
    </div>
  )
}

export default SearchBar
