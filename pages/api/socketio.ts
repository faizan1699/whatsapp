import { Server } from 'socket.io'
import { NextApiRequest } from 'next'

const SocketHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)
    res.socket.server.io = io
    io.on('connection', (socket) => {
      console.log('New socket', socket.id)
      socket.on('message', (msg) => {
        // Broadcast to others
        socket.broadcast.emit('message', msg)
      })

      socket.on('join-room', (room) => {
        socket.join(room)
      })

      socket.on('group-message', ({room, message}) => {
        socket.to(room).emit('message', message)
      })
    })
  }
  res.end()
}

export default SocketHandler
