import { Router } from 'express'
import { MissingJiraConfigError } from '../env'
import { JiraApiError, getBoardIssues } from '../jira/jiraClient'

const router = Router()

// GET /api/jira/test — prueba de conexión aislada: confirma que las credenciales del
// .env funcionan y devuelve los issues crudos del tablero, sin transformar todavía.
router.get('/test', async (_req, res) => {
  try {
    const data = await getBoardIssues()
    res.json({ ok: true, source: 'jira-agile-api', data })
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
