import express from 'express'
import cors from 'cors'
import { createHandler } from 'graphql-http/lib/use/express'
import dotenv from 'dotenv'
import { schema } from './schema/index.js'
import { getUser } from './middleware/auth.js'
import { connectDB } from './db/index.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))

app.use('/graphql', createHandler({
  schema,
  context: (req) => {
    const token = req.headers.authorization ?? ''
    const user = getUser(token)
    return { user }
  }
}))

app.get('/health', (_, res) => res.json({ ok: true }))

const PORT = process.env.PORT ?? 4000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})