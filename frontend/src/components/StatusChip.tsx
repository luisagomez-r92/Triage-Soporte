import type { TicketStatus } from '../types/ticket'

const SOLID_STYLES: Record<TicketStatus, string> = {
  'En espera': 'bg-accent/10 text-accent',
  'En revisión N1': 'bg-navy/10 text-navy',
  'Pendiente cliente': 'bg-naranja/10 text-naranja',
  'Escalado a N2': 'bg-gray-100 text-gray-600',
  'En curso N2': 'bg-accent/10 text-accent',
  'En validación': 'bg-verde/10 text-verde',
}

const DOT_COLOR: Record<TicketStatus, string> = {
  'En espera': 'bg-accent',
  'En revisión N1': 'bg-navy',
  'Pendiente cliente': 'bg-naranja',
  'Escalado a N2': 'bg-gray-400',
  'En curso N2': 'bg-accent',
  'En validación': 'bg-verde',
}

interface StatusChipProps {
  estado: TicketStatus
  // 'solid': chip grande de color de fondo (Tablero, Modal de detalle).
  // 'discreet': punto indicador + texto gris (tarjeta de las pestañas de lista,
  // REQUIREMENTS.md §5).
  variant?: 'solid' | 'discreet'
}

function StatusChip({ estado, variant = 'solid' }: StatusChipProps) {
  if (variant === 'discreet') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600">
        <span className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[estado]}`} />
        {estado}
      </span>
    )
  }

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${SOLID_STYLES[estado]}`}
    >
      {estado}
    </span>
  )
}

export default StatusChip
