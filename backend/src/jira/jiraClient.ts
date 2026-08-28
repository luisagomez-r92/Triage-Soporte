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

// GET contra la API de Jira con las credenciales de .env — comparte el manejo de
// errores (conexión fallida vs. respuesta de error de Jira) entre todas las llamadas.
async function getJiraJson<T>(path: string): Promise<T> {
  const { baseUrl, email, apiToken } = getJiraConfig()
  const url = `${baseUrl.replace(/\/+$/, '')}${path}`
  const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    throw new JiraApiError(0, `No se pudo conectar con Jira: ${message}`)
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
