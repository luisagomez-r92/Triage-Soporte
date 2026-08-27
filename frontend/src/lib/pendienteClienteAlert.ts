// REQUIREMENTS.md §5 "Alerta de tiempo crítico en Pendiente cliente": ventana de 24h
// desde que el ticket pasó a "Pendiente cliente" (mismo timestamp que ya usa
// TicketWaitingTime/TicketDetailPanel para "Sin respuesta"). Cálculo derivado, sin
// llamadas adicionales a Jira.

export type PendienteAlertTier = 'low' | 'medium' | 'high' | 'critical'

export interface PendienteClienteAlert {
  tier: PendienteAlertTier
  // Clase Tailwind para el texto del tiempo transcurrido.
  colorClass: string
  bold: boolean
  showIcon: boolean
  // 22h-24h únicamente (sección 5): "Se cierra pronto" junto al tiempo. Una vez vencido
  // (>=24h) se deja de mostrar — el mensaje de vencido de `countdownLabel` ya lo cubre.
  showClosingSoonBadge: boolean
  isOverdue: boolean
  countdownLabel: string
}

const WINDOW_HOURS = 24

export function getPendienteClienteAlert(
  pendienteDesdeIso: string,
  now: Date = new Date(),
): PendienteClienteAlert {
  const elapsedHours = (now.getTime() - new Date(pendienteDesdeIso).getTime()) / (1000 * 60 * 60)
  const isOverdue = elapsedHours >= WINDOW_HOURS

  let tier: PendienteAlertTier
  if (elapsedHours < 8) tier = 'low'
  else if (elapsedHours < 16) tier = 'medium'
  else if (elapsedHours < 22) tier = 'high'
  // 22h-24h y vencido (>=24h) comparten el tratamiento visual más severo de la tabla —
  // REQUIREMENTS.md no define un color distinto para después de las 24h.
  else tier = 'critical'

  const countdownLabel = isOverdue
    ? 'Tiempo de respuesta vencido'
    : `Se cierra en ${Math.ceil(WINDOW_HOURS - elapsedHours)}h si no hay respuesta`

  return {
    tier,
    colorClass: tier === 'low' || tier === 'medium' ? 'text-naranja' : 'text-rojo-alerta',
    bold: tier === 'medium' || tier === 'critical',
    showIcon: tier === 'high' || tier === 'critical',
    showClosingSoonBadge: elapsedHours >= 22 && !isOverdue,
    isOverdue,
    countdownLabel,
  }
}
