import { getJiraConfig } from '../env'
import { JIRA_ACTIVE_JQL, JIRA_FIELDS, type JiraChangelogHistory, type JiraIssue } from './mapper'

export class JiraApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly jiraResponse?: unknown,
  ) {
    super(message)
    this.name = 'JiraApiError'
  }
}

export interface JiraBoardIssuesResponse {
  total: number
  issues: JiraIssue[]
}

export interface JiraIssueWithChangelog {
  fields: { created: string }
  changelog: { histories: JiraChangelogHistory[] }
}

// Fallos de red (ENOTFOUND, fetch failed, etc.) al conectar con Jira son intermitentes
// en este entorno (DNS del proxy corporativo) — el segundo intento casi siempre
// funciona. 3 intentos en total, con una pausa corta entre cada uno, antes de darnos
// por vencidos y lanzar el error al usuario.
const MAX_FETCH_ATTEMPTS = 3
const RETRY_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, authHeader: string): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    try {
      return await fetch(url, {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
      })
    } catch (cause) {
      console.error(
        `Fallo de red al conectar con Jira (intento ${attempt}/${MAX_FETCH_ATTEMPTS}):`,
        cause,
        'cause:',
        cause instanceof Error ? cause.cause : undefined,
      )
      if (attempt === MAX_FETCH_ATTEMPTS) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new JiraApiError(0, `No se pudo conectar con Jira: ${message}`)
      }
      await sleep(RETRY_DELAY_MS)
    }
  }
  // Inalcanzable: el loop siempre retorna o lanza en el último intento.
  throw new JiraApiError(0, 'No se pudo conectar con Jira')
}

// GET contra la API de Jira con las credenciales de .env — comparte el manejo de
// errores (conexión fallida vs. respuesta de error de Jira) entre todas las llamadas.
async function getJiraJson<T>(path: string): Promise<T> {
  const { baseUrl, email, apiToken } = getJiraConfig()
  const url = `${baseUrl.replace(/\/+$/, '')}${path}`
  const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

  const response = await fetchWithRetry(url, authHeader)

  if (!response.ok) {
    let jiraResponse: unknown
    try {
      jiraResponse = await response.json()
    } catch {
      jiraResponse = undefined
    }

    throw new JiraApiError(
      response.status,
      `Jira respondió con error ${response.status} ${response.statusText}`,
      jiraResponse,
    )
  }

  return response.json() as Promise<T>
}

// GET /rest/agile/1.0/board/{boardId}/issue — API Agile de Jira Software (no el API
// core v3), porque "board" es un concepto de Jira Software y esta es la ruta pensada
// para traer los issues de un tablero, y es la única que trae el campo Rank
// (REQUIREMENTS.md §9). Filtra con `jql=statusCategory != Done` para traer solo los
// tickets activos (~27 de ~11,886 issues totales del tablero) sin romper el orden por
// Rank, y pide únicamente los campos que necesita el mapeo a `Ticket`.
export async function getActiveBoardIssues(): Promise<JiraBoardIssuesResponse> {
  const { boardId } = getJiraConfig()
  const params = new URLSearchParams({
    jql: JIRA_ACTIVE_JQL,
    fields: JIRA_FIELDS.join(','),
    maxResults: '100',
  })
  return getJiraJson<JiraBoardIssuesResponse>(
    `/rest/agile/1.0/board/${boardId}/issue?${params.toString()}`,
  )
}

export interface JiraIssueStatusLookup {
  found: boolean
  // statusCategory.key: 'new' | 'indeterminate' | 'done'. Ausente cuando found=false.
  statusCategoryKey?: string
}

// GET /rest/api/3/issue/{id}?fields=status — consulta puntual de UN ticket por su key,
// para el buscador (REQUIREMENTS.md §5 "Mensajes de búsqueda según estado del ticket").
// A diferencia de getJiraJson(), un 404 aquí NO es un error — es la respuesta válida
// "el ticket no existe" (caso 3 de la sección 5), así que se maneja aparte en vez de
// lanzar JiraApiError.
export async function getIssueStatusCategory(issueIdOrKey: string): Promise<JiraIssueStatusLookup> {
  const { baseUrl, email, apiToken } = getJiraConfig()
  const url = `${baseUrl.replace(/\/+$/, '')}/rest/api/3/issue/${encodeURIComponent(issueIdOrKey)}?fields=status`
  const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

  const response = await fetchWithRetry(url, authHeader)

  if (response.status === 404) {
    return { found: false }
  }

  if (!response.ok) {
    let jiraResponse: unknown
    try {
      jiraResponse = await response.json()
    } catch {
      jiraResponse = undefined
    }
    throw new JiraApiError(
      response.status,
      `Jira respondió con error ${response.status} ${response.statusText}`,
      jiraResponse,
    )
  }

  const data = (await response.json()) as { fields: { status: { statusCategory: { key: string } } } }
  return { found: true, statusCategoryKey: data.fields.status.statusCategory.key }
}

// GET /rest/api/3/issue/{id}?expand=changelog — API core v3 (no la Agile: el changelog
// de cambios de estado no depende del tablero). Historial bajo demanda, solo cuando el
// usuario abre el detalle de un ticket (REQUIREMENTS.md §9 "Historial del ticket —
// implementación") — no se pide en el polling general de /test.
export async function getIssueChangelog(issueIdOrKey: string): Promise<JiraIssueWithChangelog> {
  const params = new URLSearchParams({ expand: 'changelog', fields: 'created' })
  return getJiraJson<JiraIssueWithChangelog>(
    `/rest/api/3/issue/${encodeURIComponent(issueIdOrKey)}?${params.toString()}`,
  )
}
