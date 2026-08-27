export type TicketStatus =
  | 'En espera'
  | 'En revisión N1'
  | 'Pendiente cliente'
  | 'Escalado a N2'
  | 'En curso N2'
  | 'En validación'

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export type TicketNivel = 'N1' | 'N2'

export interface TicketResponsable {
  nombre: string
  nivel: TicketNivel
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
  // Ausente en tickets "En espera" — regla de negocio: sin historial (REQUIREMENTS.md §6).
  historial?: TicketHistoryEntry[]
  // Campo Rank de Jira (LexoRank) — solo relevante en la cola de "Escalado a N2".
  // Se compara lexicográficamente tal cual, nunca se recalcula (REQUIREMENTS.md §6, §9).
  rank?: string
}
