import type { Ticket } from '../types/ticket'

// Espeja el criterio de inclusión de cada pestaña de detalle (NivelUnoRevision.tsx,
// NivelDosEspecialistas.tsx, PendienteCliente.tsx) — usado por el mensaje "Este caso
// está abierto, pero en <pestaña>" (REQUIREMENTS.md §5, caso 1).
export function getTabLabelForTicket(ticket: Ticket): string {
  if (ticket.estado === 'Pendiente cliente') return 'Pendiente cliente'
  if (
    ticket.estado === 'Escalado a N2' ||
    ticket.estado === 'En curso N2' ||
    ticket.estado === 'Pendiente Tech'
  ) {
    return 'Nivel 2 – Especialistas'
  }
  // "En espera" solo aparece en Nivel 1 si ya tiene agente asignado — si no, solo vive
  // en el Tablero general (REQUIREMENTS.md §5 "Vista kanban por agente en Nivel 1").
  if (ticket.estado === 'En espera' && !ticket.responsable) return 'Tablero general'
  return 'Nivel 1 – Revisión'
}
