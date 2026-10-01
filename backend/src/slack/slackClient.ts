import type { SlackConfig } from '../env'

export class SlackApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SlackApiError'
  }
}

export interface SlackMessage {
  ts: string
  text: string
}

interface SlackHistoryResponse {
  ok: boolean
  error?: string
  messages?: SlackMessage[]
  has_more?: boolean
  response_metadata?: { next_cursor?: string }
}

interface SlackPermalinkResponse {
  ok: boolean
  error?: string
  permalink?: string
}

// Mismo patrón de reintentos que jiraClient.ts: los fallos de red en este entorno
// (DNS del proxy corporativo) son intermitentes, el segundo intento casi siempre
// funciona. A diferencia de Jira, un fallo aquí nunca debe tumbar /api/jira/test — por
// eso quien llama a estas funciones (slackCache.ts) atrapa cualquier error y sigue de
// largo con slackUrl: undefined para los tickets no resueltos.
const MAX_FETCH_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, botToken: string): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    try {
      return await fetch(url, {
        headers: {
          Authorization: `Bearer ${botToken}`,
          Accept: 'application/json',
        },
      })
    } catch (cause) {
      console.error(
        `Fallo de red al conectar con Slack (intento ${attempt}/${MAX_FETCH_ATTEMPTS}):`,
        cause,
        'cause:',
        cause instanceof Error ? cause.cause : undefined,
      )
      if (attempt === MAX_FETCH_ATTEMPTS) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new SlackApiError(`No se pudo conectar con Slack: ${message}`)
      }
      await sleep(RETRY_DELAY_MS)
    }
  }
  // Inalcanzable: el loop siempre retorna o lanza en el último intento.
  throw new SlackApiError('No se pudo conectar con Slack')
}

// Slack responde HTTP 200 incluso cuando la operación falla — el campo `ok` es la
// fuente real de éxito/error (ej. rate limit, token inválido, canal no encontrado).
async function getSlackJson<T extends { ok: boolean; error?: string }>(
  url: string,
  botToken: string,
): Promise<T> {
  const response = await fetchWithRetry(url, botToken)
  const data = (await response.json()) as T

  if (!response.ok || !data.ok) {
    throw new SlackApiError(`Slack respondió con error: ${data.error ?? response.statusText}`)
  }

  return data
}

// GET conversations.history paginado, acotado por `oldest` (no hace falta escanear todo
// el historial del canal: un mensaje no puede ser más viejo que el ticket que anuncia).
// `onPage` procesa cada página a medida que llega, para poder cortar temprano apenas se
// resolvieron todas las llaves pendientes (ver slackCache.ts).
export async function fetchHistorySince(
  { botToken, channelId }: SlackConfig,
  oldestEpochSeconds: number,
  onPage: (messages: SlackMessage[]) => boolean | void,
  maxPages = 10,
): Promise<void> {
  let cursor: string | undefined
  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      channel: channelId,
      oldest: String(oldestEpochSeconds),
      limit: '200',
    })
    if (cursor) params.set('cursor', cursor)

    const data = await getSlackJson<SlackHistoryResponse>(
      `https://slack.com/api/conversations.history?${params.toString()}`,
      botToken,
    )

    const detenerTemprano = onPage(data.messages ?? [])
    if (detenerTemprano) return

    cursor = data.response_metadata?.next_cursor
    if (!data.has_more || !cursor) return
  }
}

export async function getPermalink(
  { botToken, channelId }: SlackConfig,
  messageTs: string,
): Promise<string> {
  const params = new URLSearchParams({ channel: channelId, message_ts: messageTs })
  const data = await getSlackJson<SlackPermalinkResponse>(
    `https://slack.com/api/chat.getPermalink?${params.toString()}`,
    botToken,
  )
  if (!data.permalink) throw new SlackApiError('Slack no devolvió un permalink')
  return data.permalink
}
