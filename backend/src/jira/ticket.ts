// Mismo shape que frontend/src/types/ticket.ts. Duplicado porque frontend y backend son
// paquetes npm separados sin workspace compartido — si eso cambia, mover a un paquete
// `shared/` y eliminar esta copia.

export type TicketStatus =
  | 'En espera'
  | 'En revisión N1'
  | 'Pendiente cliente'
  | 'Escalado a N2'
  | 'Pendiente Tech'
  | 'En curso N2'
  | 'En validación'

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export type TicketNivel = 'N1' | 'N2'

export interface TicketResponsable {
  nombre: string
  nivel?: TicketNivel
  avatarUrl?: string
}

export interface TicketHistoryEntry {
  estado: TicketStatus
  fecha: string
}

export interface Ticket {
  id: string
  titulo: string
  solicitante: string
  empresa?: string
  estado: TicketStatus
  creadoEn: string
  prioridad?: TicketPriority
  responsable?: TicketResponsable
  historial?: TicketHistoryEntry[]
  rank?: string
}
