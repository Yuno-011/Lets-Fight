import { Server } from 'socket.io'
import { getUser } from '../middleware/auth.js'
import { Match } from '../db/Models.js'

export function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: { origin: process.env.FRONTEND_URL }
    })

    const rooms = {}

    io.on('connection', (socket) => {
        // Player joins a match room
        socket.on('joinMatch', async ({ matchId, token }) => {
            if (!rooms[matchId]) rooms[matchId] = { p1socketId: null, p1userId: null, p1Ready: false, p2socketId: null, p2userId: null, p2Ready: false, status: 'SETUP' }
            if (rooms[matchId].status === 'FINISHED') { socket.disconnect(); return }

            const user = getUser(token)
            if (!user) { socket.disconnect(); return }
            if (rooms[matchId].p1userId === user.id && rooms[matchId].p1socketId) { socket.disconnect(); return }
            if (rooms[matchId].p2userId === user.id && rooms[matchId].p2socketId) { socket.disconnect(); return }

            // Reconnect
            if (rooms[matchId].p1userId === user.id) {
                rooms[matchId].p1socketId = socket.id
                socket.join(matchId)
                socket.emit('joinedAs', { player: 1, status: rooms[matchId].status })
                io.in(matchId).emit('opponentReconnected')
                return
            }
            if (rooms[matchId].p2userId === user.id) {
                rooms[matchId].p2socketId = socket.id
                socket.join(matchId)
                socket.emit('joinedAs', { player: 2, status: rooms[matchId].status })
                io.in(matchId).emit('opponentReconnected')
                return
            }

            // Room full
            if (rooms[matchId].p1socketId && rooms[matchId].p2socketId) { socket.disconnect(); return }

            // Verify against DB
            const match = await Match.findById(matchId)
            if (!match) { socket.disconnect(); return }

            var isPlayerOne
            if (match.player_one._id.toString() === user.id) isPlayerOne = true
            else if (match.player_two._id.toString() === user.id) isPlayerOne = false
            else { socket.disconnect(); return }

            socket.join(matchId)
            if (isPlayerOne) {
                rooms[matchId].p1socketId = socket.id
                rooms[matchId].p1userId = user.id
            } else {
                rooms[matchId].p2socketId = socket.id
                rooms[matchId].p2userId = user.id
            }
            socket.emit('joinedAs', { player: isPlayerOne ? 1 : 2, status: rooms[matchId].status })
        })

        // Player is ready
        socket.on('playerReady', async ({ matchId, token }) => {
            if (!rooms[matchId]) { socket.disconnect(); return }

            const user = getUser(token)
            if (!user) { socket.disconnect(); return }

            if (rooms[matchId].p1userId === user.id) rooms[matchId].p1Ready = true
            else if (rooms[matchId].p2userId === user.id) rooms[matchId].p2Ready = true
            else { socket.disconnect(); return }

            if (rooms[matchId].p1Ready && rooms[matchId].p2Ready) {
                rooms[matchId].status = 'STARTED'
                io.in(matchId).emit('startMatch')
            }
            console.log('player ready', rooms)
        })


        // Player sends their state
        socket.on('playerState', ({ matchId, state }) => {
            socket.broadcast.to(matchId).emit('opponentState', state)
        })

        // Player lands an attack
        socket.on('playerHit', ({ matchId, direction }) => {
            socket.to(matchId).emit('hitReceived', {
                dirX: direction.x,
                dirY: direction.y
            })
        })

        // Player died
        socket.on('playerDied', ({ matchId, scores }) => {
            socket.broadcast.to(matchId).emit('playerDied', scores)
        })

        socket.on('disconnect', () => {
            for (const matchId in rooms) {
                const room = rooms[matchId]
                if (room.p1socketId === socket.id) {
                    room.p1socketId = null
                    if (room.status === 'SETUP') room.p1Ready = false
                } else if (room.p2socketId === socket.id) {
                    room.p2socketId = null
                    if (room.status === 'SETUP') room.p2Ready = false
                }
                if (room.status === 'STARTED' && (room.p1socketId || room.p2socketId)) {
                    io.in(matchId).emit('opponentDisconnected')
                }
                // clean up empty rooms
                if (!room.p1socketId && !room.p2socketId) delete rooms[matchId]
            }
            console.log('player disconnected', rooms)
        })
    })

    return io
}