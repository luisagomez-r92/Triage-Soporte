import type { PaisFiltro } from '../types/ticket'

const OPCIONES: PaisFiltro[] = ['Todos', 'Colombia', 'México']

interface CountryFilterProps {
  value: PaisFiltro
  onChange: (value: PaisFiltro) => void
}

// REQUIREMENTS.md §5 "Filtro de país 'Ubicado en'" — selector compartido entre las 4
// pestañas del módulo "Tablero" (el estado vive en App.tsx, este componente solo lo
// renderiza). Mismo lenguaje visual que el resto de controles junto al buscador.
function CountryFilter({ value, onChange }: CountryFilterProps) {
  return (
    <label className="flex flex-shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
      <span className="whitespace-nowrap text-xs font-medium text-gray-500">Ubicado en</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as PaisFiltro)}
        className="bg-transparent text-sm font-medium text-navy focus:outline-none"
      >
        {OPCIONES.map((opcion) => (
          <option key={opcion} value={opcion}>
            {opcion}
          </option>
        ))}
      </select>
    </label>
  )
}

export default CountryFilter
