import express from "express"
import cookieParser from "cookie-parser"
import userRouter from "../routes/user.routes"
import chatRouter from "../routes/chat.routes"
import { Server } from "socket.io"
import http from "http"
import { socketHandler } from "../Socket/socket"
const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/user", userRouter)
app.use("/chat", chatRouter)

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // FORCE websocket
})

// global.io = io
socketHandler(io)

app.listen(3000, () => console.log("Server running on port 3000"))
