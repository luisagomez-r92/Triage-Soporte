import { useMemo } from 'react'
import type { Ticket } from '../types/ticket'

// Exportados porque NivelDosEspecialistas.tsx también los usa para el orden de
// renderizado de sus columnas — una sola definición para ambos usos.
export function getAsignacionKey(ticket: Ticket): number {
  // "Hora en que el desarrollador tomó el ticket" = última entrada de historial.
  const fecha = ticket.historial?.at(-1)?.fecha ?? ticket.creadoEn
  return new Date(fecha).getTime()
}

export function compararPorRank(a: Ticket, b: Ticket): number {
  // Simula el campo Rank de Jira (LexoRank): comparación lexicográfica del token tal
  // cual vendría del API — nunca se recalcula combinando prioridad + hora
  // (REQUIREMENTS.md §6 y §9).
  return (a.rank ?? '').localeCompare(b.rank ?? '')
}

// REQUIREMENTS.md §5 "Badge de posición por persona" — CORRECCIÓN: este hook NO decide
// ningún orden por su cuenta (ni "en curso por hora, luego escalados por rank" ni
// ningún otro criterio). Recibe la lista de tickets YA en su orden final de
// visualización — el mismo que se va a pintar en pantalla, sea la columna Nivel 2 del
// Tablero general o cada columna de agente de la pestaña Nivel 2 — y simplemente la
// recorre de arriba hacia abajo llevando un contador independiente por responsable, sin
// importar cuántos tickets de otras personas se intercalen ni el estado de cada ticket
// (Escalado a N2 o En curso N2, mismo contador para ambos). Los llamadores son
// responsables de: (1) excluir "Pendiente Tech" antes de llamar (nunca lleva badge), y
// (2) construir el orden visual correcto usando getAsignacionKey/compararPorRank arriba.
export function useN2PositionBadges(ticketsEnOrdenVisual: Ticket[]): Map<string, number> {
  return useMemo(() => {
    const contadorPorPersona = new Map<string, number>()
    const posiciones = new Map<string, number>()
    for (const ticket of ticketsEnOrdenVisual) {
      const persona = ticket.responsable?.nombre
      if (!persona) continue
      const siguiente = (contadorPorPersona.get(persona) ?? 0) + 1
      contadorPorPersona.set(persona, siguiente)
      posiciones.set(ticket.id, siguiente)
    }
    return posiciones
  }, [ticketsEnOrdenVisual])
}
