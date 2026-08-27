import { Router } from 'express'
import { MissingJiraConfigError } from '../env'
import { JiraApiError, getActiveBoardIssues } from '../jira/jiraClient'
import { mapJiraIssuesToTickets } from '../jira/mapper'

const router = Router()

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
    if (error instanceof MissingJiraConfigError) {
      // Falta config local — no es un fallo de Jira, es nuestro servidor mal configurado.
      res.status(500).json({ ok: false, error: error.message })
      return
    }

    if (error instanceof JiraApiError) {
      // Jira respondió pero con error (credenciales inválidas, tablero inexistente,
      // etc.) — 502 porque el problema es de la integración upstream, no de quien
      // llamó a nuestro endpoint.
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
})

export default router
