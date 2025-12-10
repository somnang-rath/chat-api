// src/services/server.ts
import express from "express"
import http from "http"
import cookieParser from "cookie-parser"
import { initSocket } from "../Socket/socket"
import chatRouter from "../routes/chat.routes"
import userRouter from "../routes/user.routes"
import routerPoint from "../routes/point.routes"
import scanRouter from "../routes/scan.routes"

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use("/chat", chatRouter)
app.use("/user", userRouter)
app.use("/point", routerPoint)
app.use("/scan", scanRouter)
const server = http.createServer(app)

// initialize socket and export io from socket.ts
initSocket(server)

const PORT = process.env.PORT || 3000
server.listen(3000, () => console.log(`Server running on port ${3000}`))
