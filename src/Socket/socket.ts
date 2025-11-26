import { Server } from "socket.io"

export const socketHandler = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    // =========================
    // Join chat room
    // =========================
    socket.on("join_chat", (chatId) => {
      socket.join(chatId)
      console.log("Joined chat:", chatId)
    })

    // =========================
    // Send message in chat
    // =========================
    socket.on("send_message", (data) => {
      // Emit to the chat room
      io.to(data.chatId).emit("new_message", data)
      console.log("Sent message to room:", data.chatId)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected")
    })
  })
}
