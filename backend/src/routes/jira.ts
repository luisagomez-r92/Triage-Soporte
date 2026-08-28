import { Router, type Response } from 'express'
import { MissingJiraConfigError } from '../env'
import { JiraApiError, getActiveBoardIssues, getIssueChangelog } from '../jira/jiraClient'
import { mapChangelogToHistory, mapJiraIssuesToTickets } from '../jira/mapper'

const router = Router()

// Manejo de errores compartido entre las rutas de este router: distingue "nuestro
// servidor mal configurado" (falta .env) de "Jira respondió con error" (credenciales,
// ticket inexistente, etc. — 502 porque el problema es de la integración upstream).
function handleJiraError(error: unknown, res: Response) {
  if (error instanceof MissingJiraConfigError) {
    res.status(500).json({ ok: false, error: error.message })
    return
  }

  if (error instanceof JiraApiError) {
    res.status(502).json({
      ok: false,
      error: error.message,
      jiraStatus: error.status || undefined,
      jiraResponse: error.jiraResponse,
    })
    return
  }

  console.error('Error inesperado consultando Jira:', error)
  res.status(500).json({ ok: false, error: 'Error inesperado al consultar Jira' })
}

// GET /api/jira/test — confirma que las credenciales del .env funcionan y muestra el
// mapeo de tickets activos del tablero (Jira crudo -> shape del frontend), para
// verificar el mapeo antes de conectar el frontend (REQUIREMENTS.md §9).
router.get('/test', async (_req, res) => {
  try {
    const data = await getActiveBoardIssues()
    const { tickets, unmapped } = mapJiraIssuesToTickets(data.issues)
    res.json({
      ok: true,
      source: 'jira-agile-api',
      totalActivosEnJira: data.total,
      ticketsCount: tickets.length,
      tickets,
      // Statuses que no están en el mapeo de mapper.ts — no deberían aparecer dado el
      // filtro por statusCategory, pero se listan aparte por si Jira agrega un status
      // nuevo al board sin actualizar el mapa.
      unmapped,
      raw: data,
    })
  } catch (error) {
    handleJiraError(error, res)
  }
})

// GET /api/jira/tickets/:id/history — historial bajo demanda (REQUIREMENTS.md §9): solo
// se llama cuando el usuario abre el Modal/Panel de detalle de un ticket específico, no
// como parte del polling general de /test.
router.get('/tickets/:id/history', async (req, res) => {
  try {
    const issue = await getIssueChangelog(req.params.id)
    const historial = mapChangelogToHistory(issue.fields.created, issue.changelog.histories)
    res.json({ ok: true, historial })
  } catch (error) {
    handleJiraError(error, res)
  }
})

export default router
