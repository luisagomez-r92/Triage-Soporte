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

// REQUIREMENTS.md §5 "Filtro de país 'Ubicado en'" — exclusivo del módulo "Tablero".
export type Pais = 'Colombia' | 'México'
export type PaisFiltro = 'Todos' | Pais

export interface TicketResponsable {
  nombre: string
  // Ausente en "Pendiente cliente": el ticket pudo pausarse estando en N1 o en N2 y,
  // sin el historial (diferido), no hay forma de saberlo — REQUIREMENTS.md §9.
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
  // Ausente en tickets "En espera" — regla de negocio: sin historial (REQUIREMENTS.md §6).
  historial?: TicketHistoryEntry[]
  // Campo Rank de Jira (LexoRank) — solo relevante en la cola de "Escalado a N2".
  // Se compara lexicográficamente tal cual, nunca se recalcula (REQUIREMENTS.md §6, §9).
  rank?: string
  // Campo "Country" de Jira — ausente si el ticket no lo tiene poblado.
  pais?: Pais
}
