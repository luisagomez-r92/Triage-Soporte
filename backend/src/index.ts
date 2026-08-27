import 'dotenv/config'
import express from 'express'
import jiraRouter from './routes/jira'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 3001

app.use('/api/jira', jiraRouter)

app.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`)
})
