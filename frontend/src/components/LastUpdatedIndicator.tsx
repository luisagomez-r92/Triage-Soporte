import { useEffect, useState } from 'react'

interface LastUpdatedIndicatorProps {
  lastUpdatedAt: number | null
  isRefreshing: boolean
  refreshError: string | null
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 5) return 'justo ahora'
  if (seconds < 60) return `hace ${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `hace ${minutes} min`
}

// Timer propio de 5s solo para refrescar el texto "hace Xs" — aislado en este
// componente para no re-renderizar el resto de la app en cada tick.
function LastUpdatedIndicator({ lastUpdatedAt, isRefreshing, refreshError }: LastUpdatedIndicatorProps) {
  const [, forceTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 5000)
    return () => clearInterval(id)
  }, [])

  if (isRefreshing) {
    return <span className="text-xs text-gray-400">Actualizando…</span>
  }

  if (refreshError) {
    return (
      <span className="text-xs text-naranja" title={refreshError}>
        No se pudo actualizar — reintentando…
      </span>
    )
  }

  if (lastUpdatedAt === null) return null

  return (
    <span className="text-xs text-gray-400">
      Actualizado {formatElapsed(Date.now() - lastUpdatedAt)}
    </span>
  )
}

export default LastUpdatedIndicator
