import { getSlackConfig } from '../env'
import { fetchHistorySince, getPermalink, type SlackMessage } from './slackClient'

// Caché en memoria ticketKey -> estado de resolución en Slack. Vive mientras viva el
// proceso — si Render reinicia el servicio por inactividad (plan gratuito), se pierde y
// se reconstruye sola en el siguiente ciclo de /api/jira/test, ya que son pocos tickets
// activos y recientes.
type CacheEntry =
  | { status: 'found'; permalink: string }
  // Mensaje ya encontrado en el historial, falta solo pedir su permalink (ej. el
  // intento anterior de chat.getPermalink falló) — no hace falta re-buscar en el
  // historial, solo reintentar esta llamada puntual.
  | { status: 'ts-found'; ts: string }
  // Se buscó en la ventana de tiempo correspondiente y no apareció — se reintenta en
  // el próximo ciclo mientras el ticket siga activo.
  | { status: 'not-found' }

const cache = new Map<string, CacheEntry>()

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function necesitaReintento(entry: CacheEntry | undefined): boolean {
  return entry === undefined || entry.status === 'not-found'
}

// Un mensaje de Slack no puede ser más viejo que el ticket que anuncia — acota la
// ventana de búsqueda al ticket activo (entre los pendientes) más antiguo, con un
// colchón de 1 hora por si el reloj de quien publica el mensaje difiere un poco.
function calcularOldestEpoch(ticketsPendientes: { creadoEn: string }[]): number {
  const masAntiguo = Math.min(...ticketsPendientes.map((t) => new Date(t.creadoEn).getTime()))
  const conColchon = masAntiguo - 60 * 60 * 1000
  return Math.floor(conColchon / 1000)
}

async function resolverPermalinks(
  ticketIds: string[],
  slackConfig: NonNullable<ReturnType<typeof getSlackConfig>>,
): Promise<void> {
  // Cada uno se intenta por separado: si uno falla (ej. rate limit puntual), no debe
  // tumbar a los demás — queda en 'ts-found' para reintentar solo esta llamada el
  // próximo ciclo, sin repetir la búsqueda en el historial.
  for (const ticketId of ticketIds) {
    const entry = cache.get(ticketId)
    if (entry?.status !== 'ts-found') continue
    try {
      const permalink = await getPermalink(slackConfig, entry.ts)
      cache.set(ticketId, { status: 'found', permalink })
    } catch (error) {
      console.error(`No se pudo obtener el permalink de Slack para ${ticketId}:`, error)
    }
  }
}

// REQUIREMENTS.md — botón "Abrir en Slack" (Tablero): se llama en cada ciclo de
// /api/jira/test, pero solo golpea la API de Slack cuando hay tickets activos todavía
// sin resolver (cache miss) — si todos ya están en caché, no hace ninguna llamada.
// Nunca lanza: cualquier fallo de Slack (rate limit, red, config faltante) se traga acá
// y los tickets afectados simplemente quedan sin slackUrl, sin afectar el resto de la
// respuesta de /test (mismo nivel de tolerancia a fallos que ya existe para Jira).
export async function resolveSlackUrls(ticketsActivos: { id: string; creadoEn: string }[]): Promise<void> {
  const pendientes = ticketsActivos.filter((t) => necesitaReintento(cache.get(t.id)))
  if (pendientes.length === 0) return

  const slackConfig = getSlackConfig()
  if (!slackConfig) return

  try {
    const clavesPendientes = new Map(
      pendientes.map((t) => [t.id, new RegExp(`\\b${escapeRegExp(t.id)}\\b`)]),
    )
    const oldestEpoch = calcularOldestEpoch(pendientes)

    await fetchHistorySince(slackConfig, oldestEpoch, (messages: SlackMessage[]) => {
      for (const message of messages) {
        for (const [ticketId, regex] of clavesPendientes) {
          if (regex.test(message.text)) {
            cache.set(ticketId, { status: 'ts-found', ts: message.ts })
            clavesPendientes.delete(ticketId)
          }
        }
      }
      // Cortar la paginación apenas no queden llaves pendientes por buscar.
      return clavesPendientes.size === 0
    })

    // Lo que haya quedado en clavesPendientes no se encontró en la ventana buscada —
    // se marca para reintentar en el próximo ciclo (no se cachea como "nunca más").
    for (const ticketId of clavesPendientes.keys()) {
      cache.set(ticketId, { status: 'not-found' })
    }

    await resolverPermalinks(
      pendientes.map((t) => t.id),
      slackConfig,
    )
  } catch (error) {
    console.error('No se pudo resolver el botón "Abrir en Slack" para este ciclo:', error)
    // No se re-lanza: los tickets de `pendientes` que no hayan quedado ya en caché
    // siguen como estaban (sin entrada), getSlackUrl() los devuelve como undefined.
  }
}

export function getSlackUrl(ticketId: string): string | undefined {
  const entry = cache.get(ticketId)
  return entry?.status === 'found' ? entry.permalink : undefined
}
