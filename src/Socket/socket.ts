// src/Socket/socket.ts
import { Server } from "socket.io"
import http from "http"

export let io: Server

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket"],
  })

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("join_user", (userId: string) => {
      socket.join(userId)
      console.log("Joined user room:", userId)
    })

    socket.on("join_chat", (chatId: string) => {
      socket.join(chatId)
      console.log("Joined chat room:", chatId)
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
