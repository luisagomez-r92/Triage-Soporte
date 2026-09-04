import type { TicketStatus } from '../types/ticket'

const SOLID_STYLES: Record<TicketStatus, string> = {
  'En espera': 'bg-accent/10 text-accent',
  'En revisión N1': 'bg-navy/10 text-navy',
  'Pendiente cliente': 'bg-naranja/10 text-naranja',
  'Escalado a N2': 'bg-gray-100 text-gray-600',
  // Variante de "Escalado a N2" (REQUIREMENTS.md §5) — mismo estilo neutro.
  'Pendiente Tech': 'bg-gray-100 text-gray-600',
  'En curso N2': 'bg-accent/10 text-accent',
  'En validación': 'bg-verde/10 text-verde',
}

const DOT_COLOR: Record<TicketStatus, string> = {
  'En espera': 'bg-accent',
  'En revisión N1': 'bg-navy',
  'Pendiente cliente': 'bg-naranja',
  'Escalado a N2': 'bg-gray-400',
  'Pendiente Tech': 'bg-gray-400',
  'En curso N2': 'bg-accent',
  'En validación': 'bg-verde',
}

const SOLID_SIZE: Record<'default' | 'compact', string> = {
  default: 'px-2 py-0.5 text-xs',
  // REQUIREMENTS.md — "Tarjeta de ticket — encabezado en una sola línea": el chip del
  // Tablero general se achica para que quepa junto al círculo de progreso y el número de
  // ticket sin bajar a una segunda línea. Exclusivo de ese contexto (board/TicketCard).
  compact: 'px-1.5 py-0.5 text-[10px]',
}

interface StatusChipProps {
  estado: TicketStatus
  // 'solid': chip grande de color de fondo (Tablero, Modal de detalle, Nivel 2).
  // 'discreet': punto indicador + texto gris (tarjeta de las pestañas de lista,
  // REQUIREMENTS.md §5).
  variant?: 'solid' | 'discreet'
  // Solo aplica al variant 'solid' — ver SOLID_SIZE arriba.
  size?: 'default' | 'compact'
}

function StatusChip({ estado, variant = 'solid', size = 'default' }: StatusChipProps) {
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
      className={`whitespace-nowrap rounded-full font-medium ${SOLID_STYLES[estado]} ${SOLID_SIZE[size]}`}
    >
      {estado}
    </span>
  )
}

export default StatusChip
