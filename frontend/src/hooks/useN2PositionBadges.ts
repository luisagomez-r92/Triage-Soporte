import { useMemo } from 'react'
import type { Ticket, TicketStatus } from '../types/ticket'

const NIVEL2_ESTADOS: TicketStatus[] = ['Escalado a N2', 'En curso N2']

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

// REQUIREMENTS.md §5 "Badge de posición por persona" — fuente única, reutilizada tanto
// por la pestaña Nivel 2 – Especialistas (columnas Escalados/En curso) como por la
// columna Nivel 2 del Tablero general (sección 4), para que ambas muestren el mismo
// número. "Pendiente Tech" queda fuera a propósito: nunca entra a este cálculo, así que
// esos tickets nunca aparecen en el mapa resultante.
//
// Recibe el set de tickets activos completo (no uno ya filtrado por búsqueda) — así el
// número de cada persona no cambia según lo que se esté buscando en ese momento, es un
// atributo estable de la cola.
export function useN2PositionBadges(tickets: Ticket[]): Map<string, number> {
  return useMemo(() => {
    const activos = tickets.filter((ticket) => NIVEL2_ESTADOS.includes(ticket.estado))
    const enCursoOrdenado = activos
      .filter((ticket) => ticket.estado === 'En curso N2')
      .sort((a, b) => getAsignacionKey(a) - getAsignacionKey(b))
    const escaladosOrdenados = activos
      .filter((ticket) => ticket.estado === 'Escalado a N2')
      .sort(compararPorRank)

    const contadorPorPersona = new Map<string, number>()
    const posiciones = new Map<string, number>()
    for (const ticket of [...enCursoOrdenado, ...escaladosOrdenados]) {
      const persona = ticket.responsable?.nombre
      if (!persona) continue
      const siguiente = (contadorPorPersona.get(persona) ?? 0) + 1
      contadorPorPersona.set(persona, siguiente)
      posiciones.set(ticket.id, siguiente)
    }
    return posiciones
  }, [tickets])
}
