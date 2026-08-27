import type { TicketStatus } from '../types/ticket'

export const PROGRESS_BY_STATUS: Record<TicketStatus, number> = {
  'En espera': 0,
  'En revisión N1': 30,
  'Pendiente cliente': 35,
  'Escalado a N2': 40,
  'Pendiente Tech': 45,
  'En curso N2': 60,
  'En validación': 90,
}
