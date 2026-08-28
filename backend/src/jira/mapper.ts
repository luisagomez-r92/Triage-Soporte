import type { Ticket, TicketHistoryEntry, TicketNivel, TicketPriority, TicketStatus } from './ticket'

// Campos que pedimos a la API Agile — ver REQUIREMENTS.md §9 ("Mapeo de estados Jira →
// REQUIREMENTS.md — CONFIRMADO"). customfield_10019 = Rank, customfield_10076 = Company.
export const JIRA_FIELDS = [
  'summary',
  'status',
  'priority',
  'assignee',
  'reporter',
  'created',
  'customfield_10019',
  'customfield_10076',
] as const

// statusCategory != Done: excluye los ~11,886 issues históricos/cerrados del tablero,
// dejando solo los activos (REQUIREMENTS.md §9 "Filtrado de tickets activos"). No lleva
// ORDER BY propio, así que no rompe el orden por Rank que ya trae el board.
export const JIRA_ACTIVE_JQL = 'statusCategory != Done'

export interface JiraIssue {
  key: string
  fields: {
    summary: string
    status: { name: string }
    priority?: { name: string } | null
    assignee?: { displayName: string } | null
    reporter?: { displayName: string } | null
    created: string
    customfield_10019?: string | null
    customfield_10076?: string | null
  }
}

// REQUIREMENTS.md §9 "Mapeo de estados Jira → REQUIREMENTS.md — CONFIRMADO". Exportado
// porque mapChangelogToHistory() (historial bajo demanda) usa el mismo mapa — una sola
// fuente de verdad para "status de Jira -> estado de la app".
export const ESTADO_BY_JIRA_STATUS: Record<string, TicketStatus> = {
  'Esperando por ayuda': 'En espera',
  'Gestión Nivel 1': 'En revisión N1',
  'Escalado Nivel 2': 'Escalado a N2',
  Pendiente: 'Pendiente Tech',
  'Gestion Nivel 2': 'En curso N2',
  'Esperando respuesta de cliente': 'Pendiente cliente',
  'Proceso de Validación': 'En validación',
}

// REQUIREMENTS.md §6 "Prioridades N2 — mapeo de 5 niveles de Jira a 4 niveles en la app".
const PRIORIDAD_BY_JIRA_PRIORITY: Record<string, TicketPriority> = {
  Highest: 'Critical',
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
  Lowest: 'Low',
}

// Prioridad solo es visible en tickets de Nivel 2 (REQUIREMENTS.md §6).
const NIVEL2_ESTADOS: TicketStatus[] = ['Escalado a N2', 'Pendiente Tech', 'En curso N2']

// REQUIREMENTS.md §9 "Responsable y nivel (N1/N2) — CONFIRMADO": el nivel del badge se
// deriva del estado actual del ticket, no de la identidad de la persona. "Pendiente
// cliente" queda fuera de este mapa a propósito — no tiene nivel hasta que exista historial.
const NIVEL_BY_ESTADO: Partial<Record<TicketStatus, TicketNivel>> = {
  'En espera': 'N1',
  'En revisión N1': 'N1',
  'En validación': 'N1',
  'Escalado a N2': 'N2',
  'Pendiente Tech': 'N2',
  'En curso N2': 'N2',
}

export interface MapResult {
  tickets: Ticket[]
  // Issues cuyo status de Jira no está en ESTADO_BY_JIRA_STATUS — no deberían aparecer
  // dado el filtro JQL por statusCategory, pero si Jira agrega un status nuevo al board
  // sin actualizar este mapa, se reportan aquí en vez de romper el endpoint o mapear mal.
  unmapped: { key: string; statusName: string }[]
}

export function mapJiraIssueToTicket(issue: JiraIssue): Ticket | null {
  const estado = ESTADO_BY_JIRA_STATUS[issue.fields.status.name]
  if (!estado) return null

  const responsable = issue.fields.assignee
    ? {
        nombre: issue.fields.assignee.displayName,
        nivel: NIVEL_BY_ESTADO[estado],
      }
    : undefined

  const prioridadJira = issue.fields.priority?.name
  const prioridad =
    NIVEL2_ESTADOS.includes(estado) && prioridadJira
      ? PRIORIDAD_BY_JIRA_PRIORITY[prioridadJira]
      : undefined

  return {
    id: issue.key,
    titulo: issue.fields.summary,
    solicitante: issue.fields.reporter?.displayName ?? '',
    empresa: issue.fields.customfield_10076 ?? undefined,
    estado,
    creadoEn: issue.fields.created,
    prioridad,
    responsable,
    // Diferido — REQUIREMENTS.md §9 "Historial del ticket — diferido a un paso posterior".
    historial: undefined,
    rank: issue.fields.customfield_10019 ?? undefined,
  }
}

export function mapJiraIssuesToTickets(issues: JiraIssue[]): MapResult {
  const tickets: Ticket[] = []
  const unmapped: MapResult['unmapped'] = []

  for (const issue of issues) {
    const ticket = mapJiraIssueToTicket(issue)
    if (ticket) {
      tickets.push(ticket)
    } else {
      unmapped.push({ key: issue.key, statusName: issue.fields.status.name })
    }
  }

  return { tickets, unmapped }
}

export interface JiraChangelogHistoryItem {
  field: string
  toString: string | null
}

export interface JiraChangelogHistory {
  created: string
  items: JiraChangelogHistoryItem[]
}

// REQUIREMENTS.md §9 "Historial del ticket — implementación": el changelog de Jira solo
// registra transiciones (no el estado inicial al crear el ticket), así que se antepone
// una entrada sintética "En espera" en `created`. Solo se quedan los items de campo
// "status" — el changelog trae cambios de todos los campos (assignee, priority, etc.).
// Los toString que no mapean a un estado conocido (ej. transiciones hacia
// Resuelto/Cerrada/Cancelado, fuera del alcance de la cola activa) se omiten en vez de
// romper la línea de tiempo.
export function mapChangelogToHistory(
  createdAt: string,
  histories: JiraChangelogHistory[],
): TicketHistoryEntry[] {
  const transiciones = [...histories]
    .sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
    .flatMap((history) =>
      history.items
        .filter((item) => item.field === 'status' && item.toString)
        .map((item) => ({ toString: item.toString as string, fecha: history.created })),
    )
    .map(({ toString, fecha }) => ({ estado: ESTADO_BY_JIRA_STATUS[toString], fecha }))
    .filter((entry): entry is TicketHistoryEntry => Boolean(entry.estado))

  return [{ estado: 'En espera', fecha: createdAt }, ...transiciones]
}
