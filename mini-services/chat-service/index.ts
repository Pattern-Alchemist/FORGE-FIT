/**
 * Forge — Chat Socket.io mini-service
 *
 * Real-time messaging relay between coaches and clients.
 *
 * Two servers:
 *   - Port 3003: Socket.io (for client connections)
 *   - Port 3004: HTTP broadcast endpoint (for server actions to POST new messages)
 *
 * Flow:
 *   1. Client connects to port 3003 via socket.io
 *   2. Identifies with their session (userId, role, coachId/clientId)
 *   3. Joins conversation rooms
 *   4. When a server action persists a message, it POSTs to port 3004/broadcast
 *   5. The broadcast handler emits to the relevant room via io.to()
 *   6. Connected clients receive the message instantly
 */
import { createServer } from 'http'
import { Server } from 'socket.io'

// ── Socket.io server (port 3003) ─────────────────────────────────────────────
const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

const connections = new Map<string, { userId: string; role: string; coachId?: string; clientId?: string }>()

io.on('connection', (socket) => {
  console.log(`[chat] connected: ${socket.id}`)

  socket.on('identify', (data: { userId: string; role: string; coachId?: string; clientId?: string }) => {
    connections.set(socket.id, data)
    if (data.role === 'coach' && data.coachId) {
      socket.join(`coach:${data.coachId}`)
    }
    if (data.role === 'client' && data.clientId) {
      socket.join(`conv:${data.clientId}`)
      socket.join(`client:${data.clientId}`)
    }
    console.log(`[chat] identified: ${data.userId} as ${data.role}`)
  })

  socket.on('join-conversation', (clientId: string) => {
    socket.join(`conv:${clientId}`)
  })

  socket.on('leave-conversation', (clientId: string) => {
    socket.leave(`conv:${clientId}`)
  })

  socket.on('typing', (data: { clientId: string; isTyping: boolean; senderType: string }) => {
    socket.to(`conv:${data.clientId}`).emit('typing', data)
  })

  socket.on('disconnect', () => {
    const conn = connections.get(socket.id)
    if (conn) {
      console.log(`[chat] disconnected: ${conn.userId}`)
      connections.delete(socket.id)
    }
  })

  socket.on('error', (error) => {
    console.error(`[chat] socket error (${socket.id}):`, error)
  })
})

httpServer.listen(3003, () => {
  console.log('[chat] Socket.io service running on port 3003')
})

// ── Broadcast HTTP endpoint (port 3004) ─────────────────────────────────────
// Server actions POST here to emit to connected clients.
const broadcastServer = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  let body = ''
  req.on('data', (chunk: string) => (body += chunk))
  req.on('end', () => {
    try {
      const data = JSON.parse(body)
      if (req.url === '/broadcast') {
        io.to(`conv:${data.clientId}`).emit('new-message', data.message)
      } else if (req.url === '/typing') {
        io.to(`conv:${data.clientId}`).emit('typing', data)
      }
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Bad request' }))
    }
  })
})

broadcastServer.listen(3004, () => {
  console.log('[chat] Broadcast HTTP endpoint running on port 3004')
})

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`[chat] ${signal} received, shutting down...`)
  httpServer.close()
  broadcastServer.close()
  process.exit(0)
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
