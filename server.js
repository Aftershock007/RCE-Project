const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const ACTIONS = require("./Actions")
const path = require("path")

const app = express()
const server = http.createServer(app)
const io = new Server(server)

app.use(express.static("dist"))
app.use((res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"))
})

const userSocketMap = {}
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId]
      }
    }
  )
}

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username
    socket.join(roomId)
    const clients = getAllConnectedClients(roomId)
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id
      })
    })
  })

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code })
  })
  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code })
  })

  socket.on(ACTIONS.INPUT_CHANGE, ({ roomId, input }) => {
    socket.in(roomId).emit(ACTIONS.INPUT_CHANGE, { input })
  })
  socket.on(ACTIONS.SYNC_INPUT, ({ socketId, input }) => {
    io.to(socketId).emit(ACTIONS.INPUT_CHANGE, { input })
  })

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms]
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id]
      })
    })

    delete userSocketMap[socket.id]
    socket.leave()
  })
})

const PORT = 5000
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
