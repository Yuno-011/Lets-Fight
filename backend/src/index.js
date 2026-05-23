import express from 'express'
import cors from 'cors'
import { createHandler } from 'graphql-http/lib/use/express'
import dotenv from 'dotenv'
import { schema } from './schema/index.js'
import { getUser } from './middleware/auth.js'
import { connectDB } from './db/index.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { initSocket } from './game/index.js'

dotenv.config()

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL }))
const httpServer = createServer(app)

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

// game socket
initSocket(httpServer)

connectDB().then(() => {
  httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})