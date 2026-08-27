import type { TicketStatus } from '../types/ticket'

// REQUIREMENTS.md §6: verde = regresado de N2 para validación en N1;
// azul = en curso activo por desarrollador de N2.
const LEFT_BORDER_BY_STATUS: Partial<Record<TicketStatus, string>> = {
  'En validación': 'border-l-verde',
  'En curso N2': 'border-l-accent',
}

export function getLeftBorderClass(estado: TicketStatus): string {
  return LEFT_BORDER_BY_STATUS[estado] ?? 'border-l-transparent'
}
