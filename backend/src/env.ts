export interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  boardId: string
}

export class MissingJiraConfigError extends Error {
  constructor(public readonly missingVars: string[]) {
    super(`Faltan variables de entorno de Jira: ${missingVars.join(', ')}`)
    this.name = 'MissingJiraConfigError'
  }
}

export function getJiraConfig(): JiraConfig {
  const baseUrl = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const apiToken = process.env.JIRA_API_TOKEN
  const boardId = process.env.JIRA_BOARD_ID

  const missing = [
    !baseUrl && 'JIRA_BASE_URL',
    !email && 'JIRA_EMAIL',
    !apiToken && 'JIRA_API_TOKEN',
    !boardId && 'JIRA_BOARD_ID',
  ].filter((name): name is string => Boolean(name))

  if (missing.length > 0) {
    throw new MissingJiraConfigError(missing)
  }

  return { baseUrl: baseUrl!, email: email!, apiToken: apiToken!, boardId: boardId! }
}

export interface SlackConfig {
  botToken: string
  channelId: string
}

// A diferencia de Jira, Slack es una funcionalidad adicional (botón "Abrir en Slack"), no
// crítica para el funcionamiento del tablero — si falta la config, el botón simplemente
// queda deshabilitado para todos los tickets (slackUrl: undefined), sin romper /test. Por
// eso no lanza error: devuelve null en vez de un MissingSlackConfigError.
export function getSlackConfig(): SlackConfig | null {
  const botToken = process.env.SLACK_BOT_TOKEN
  const channelId = process.env.SLACK_CHANNEL_ID

  if (!botToken || !channelId) return null

  return { botToken, channelId }
}
