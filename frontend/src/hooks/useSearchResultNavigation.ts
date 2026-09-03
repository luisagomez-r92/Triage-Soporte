import { useEffect, useState } from 'react'

interface UseSearchResultNavigationResult {
  activeIndex: number
  total: number
  goToNext: () => void
  goToPrev: () => void
}

// REQUIREMENTS.md §5 "Navegación entre resultados de búsqueda": scroll automático a la
// primera coincidencia + indicador flotante para saltar entre el resto, sin perder el
// resaltado existente ni depender de scroll manual.
//
// `orderedMatchedIds` debe venir en el mismo orden visual en que se renderizan las
// tarjetas en esa pestaña (columna por columna, de arriba hacia abajo) — cada pestaña
// arma ese orden a partir de los datos que ya tiene, este hook no sabe nada del layout.
export function useSearchResultNavigation(
  orderedMatchedIds: string[],
): UseSearchResultNavigationResult {
  const [activeIndex, setActiveIndex] = useState(0)

  // Compara por contenido, no por referencia: quien llama recalcula `orderedMatchedIds`
  // con .filter()/.map() en cada render (sin memoizar contra [tickets, matchedIds]), así
  // que la referencia cambia aunque el contenido sea el mismo — ej. al hacer clic en
  // "siguiente", el cambio de estado interno dispara un re-render del padre que arma un
  // array nuevo con los mismos IDs. Si comparáramos por referencia, cada clic resetearía
  // el índice a 0 antes de que el usuario viera el avance.
  const matchKey = orderedMatchedIds.join('|')

  // Cada vez que cambia el set de coincidencias (nueva búsqueda), vuelve a la primera.
  useEffect(() => {
    setActiveIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKey])

  const total = orderedMatchedIds.length
  const activeId = orderedMatchedIds[activeIndex] ?? null

  useEffect(() => {
    if (!activeId) return
    const el = document.querySelector(`[data-ticket-id="${CSS.escape(activeId)}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [activeId])

  const goToNext = () => setActiveIndex((current) => (total === 0 ? 0 : (current + 1) % total))
  const goToPrev = () =>
    setActiveIndex((current) => (total === 0 ? 0 : (current - 1 + total) % total))

  return { activeIndex, total, goToNext, goToPrev }
}
