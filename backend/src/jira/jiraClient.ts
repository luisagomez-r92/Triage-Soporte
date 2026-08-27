import { getJiraConfig } from '../env'
import { JIRA_ACTIVE_JQL, JIRA_FIELDS, type JiraIssue } from './mapper'

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

// GET /rest/agile/1.0/board/{boardId}/issue — API Agile de Jira Software (no el API
// core v3), porque "board" es un concepto de Jira Software y esta es la ruta pensada
// para traer los issues de un tablero, y es la única que trae el campo Rank
// (REQUIREMENTS.md §9). Filtra con `jql=statusCategory != Done` para traer solo los
// tickets activos (~27 de ~11,886 issues totales del tablero) sin romper el orden por
// Rank, y pide únicamente los campos que necesita el mapeo a `Ticket`.
export async function getActiveBoardIssues(): Promise<JiraBoardIssuesResponse> {
  const { baseUrl, email, apiToken, boardId } = getJiraConfig()

  const params = new URLSearchParams({
    jql: JIRA_ACTIVE_JQL,
    fields: JIRA_FIELDS.join(','),
    maxResults: '100',
  })
  const url = `${baseUrl.replace(/\/+$/, '')}/rest/agile/1.0/board/${boardId}/issue?${params.toString()}`
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

  return response.json() as Promise<JiraBoardIssuesResponse>
}
