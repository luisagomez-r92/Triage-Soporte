interface SearchResultNavigatorProps {
  activeIndex: number
  total: number
  onPrev: () => void
  onNext: () => void
}

// REQUIREMENTS.md §5 "Navegación entre resultados de búsqueda": solo se muestra con más
// de un resultado (el llamador ya filtra eso) — con uno solo, el scroll automático basta.
function SearchResultNavigator({ activeIndex, total, onPrev, onNext }: SearchResultNavigatorProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <span className="text-xs font-medium text-navy">
        {activeIndex + 1} de {total}
      </span>
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Resultado anterior"
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-navy"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label="Resultado siguiente"
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-navy"
        >
          ▼
        </button>
      </div>
    </div>
  )
}

export default SearchResultNavigator
