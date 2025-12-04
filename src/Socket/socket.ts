// src/Socket/socket.ts
import { Server } from "socket.io"
import http from "http"
import jwt from "jsonwebtoken"
import { handleLocationEvents } from "../controllers/locationController"
import { ACCESS_SECRET } from "../config/jwt"

export let io: Server

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  })
  // io.use(authMiddleware)
  // Add socket auth middleware
  io.use((socket: any, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error("No token"))

    try {
      const decoded = jwt.verify(token, ACCESS_SECRET)
      socket.data.user = decoded
      console.log("🟢 SOCKET USER =", decoded)
      next()
    } catch (err) {
      next(new Error("Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)
    handleLocationEvents(io, socket)

    socket.on("join_user", (userId: string) => {
      socket.join(userId)
    })

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId)
    })

    socket.on("send_message", (data: any) => {
      // This handler is optional: supports socket-originated sends
      const { chatId, senderId, receiverId, message } = data
      // Emit to chat room
      io.to(chatId).emit("new_message", data)
      // Emit to users (chat list update)
      if (senderId) io.to(senderId).emit("new_message", { chatId })
      if (receiverId) io.to(receiverId).emit("new_message", { chatId })
      console.log("Message sent via websocket:", chatId)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id)
    })
  })

  return io
}
