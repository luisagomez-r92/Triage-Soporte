import type { TicketNivel } from '../types/ticket'

const STYLES: Record<TicketNivel, string> = {
  N1: 'bg-navy/10 text-navy',
  N2: 'bg-accent/10 text-accent',
}

interface LevelBadgeProps {
  nivel: TicketNivel
}

function LevelBadge({ nivel }: LevelBadgeProps) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STYLES[nivel]}`}
    >
      {nivel}
    </span>
  )
}

export default LevelBadge
