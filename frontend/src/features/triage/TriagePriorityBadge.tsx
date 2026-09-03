import type { TicketPriority } from '../../types/ticket'

// REQUIREMENTS.md — Dashboard resumen: colores distintivos por nivel de prioridad.
// `dark` para los paneles superiores (fondo azul marino); `light` para "Próximos ·
// Nivel 2" (fondo blanco) — mismo significado, distinto contraste según el fondo.
const DARK_STYLES: Record<TicketPriority, string> = {
  Critical: 'bg-red-500/20 text-red-300',
  High: 'bg-amber-500/20 text-amber-300',
  Medium: 'bg-blue-500/20 text-blue-300',
  Low: 'bg-white/10 text-slate-300',
}

const LIGHT_STYLES: Record<TicketPriority, string> = {
  Critical: 'bg-red-50 text-red-700',
  High: 'bg-amber-50 text-amber-700',
  Medium: 'bg-blue-50 text-blue-700',
  Low: 'bg-gray-100 text-gray-600',
}

// Tamaño por variante (no solo color): la corrección de tamaño compacto es exclusiva de
// los 2 paneles superiores (variant="dark") — "Próximos · Nivel 2" (variant="light")
// no cambia.
const SIZE_BY_VARIANT: Record<'dark' | 'light', string> = {
  dark: 'px-1 py-0.5 text-[9px]',
  light: 'px-1.5 py-0.5 text-[10px]',
}

interface TriagePriorityBadgeProps {
  prioridad: TicketPriority
  variant?: 'dark' | 'light'
}

function TriagePriorityBadge({ prioridad, variant = 'dark' }: TriagePriorityBadgeProps) {
  const styles = variant === 'dark' ? DARK_STYLES : LIGHT_STYLES
  return (
    <span
      className={`flex-shrink-0 rounded font-semibold uppercase tracking-wide ${styles[prioridad]} ${SIZE_BY_VARIANT[variant]}`}
    >
      {prioridad}
    </span>
  )
}

export default TriagePriorityBadge
