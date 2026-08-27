import { getJiraConfig } from '../env'

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

// GET /rest/agile/1.0/board/{boardId}/issue — API Agile de Jira Software (no el API
// core v3), porque "board" es un concepto de Jira Software y esta es la ruta pensada
// para traer los issues de un tablero. Devuelve la primera página tal cual la entrega
// Jira, sin transformar (REQUIREMENTS.md §9): el mapeo a nuestro formato y la
// paginación completa llegan en un paso posterior.
export async function getBoardIssues(): Promise<unknown> {
  const { baseUrl, email, apiToken, boardId } = getJiraConfig()

  const url = `${baseUrl.replace(/\/+$/, '')}/rest/agile/1.0/board/${boardId}/issue`
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

  return response.json()
}
