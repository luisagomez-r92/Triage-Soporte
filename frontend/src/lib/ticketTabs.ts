import type { Ticket } from '../types/ticket'

// Espeja el criterio de inclusión de cada pestaña de detalle (NivelUnoRevision.tsx,
// NivelDosEspecialistas.tsx, PendienteCliente.tsx) — usado por el mensaje "Este caso
// está abierto, pero en <pestaña>" (REQUIREMENTS.md §5, caso 1).
export function getTabLabelForTicket(ticket: Ticket): string {
  // "Pendiente Tech" se mudó de Nivel 2 – Especialistas a la pestaña "Pendiente" junto a
  // "Pendiente cliente" (REQUIREMENTS.md §4/§5, reestructuración de dos columnas).
  if (ticket.estado === 'Pendiente cliente' || ticket.estado === 'Pendiente Tech') return 'Pendiente'
  if (ticket.estado === 'Escalado a N2' || ticket.estado === 'En curso N2') {
    return 'Nivel 2 – Especialistas'
  }
  // "En espera" solo aparece en Nivel 1 si ya tiene agente asignado — si no, solo vive
  // en el Tablero general (REQUIREMENTS.md §5 "Vista kanban por agente en Nivel 1").
  if (ticket.estado === 'En espera' && !ticket.responsable) return 'Tablero general'
  return 'Nivel 1 – Revisión'
}
