import { Server } from "socket.io"

export const socketHandler = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("join_chat", (chatId) => {
      socket.join(chatId)
      console.log("Joined chat:", chatId)
    })

    socket.on("send_message", (data) => {
      io.to(data.chatId).emit("new_message", data)
    })

    socket.on("disconnect", () => {
      console.log("User disconnected")
    })
  })
}
