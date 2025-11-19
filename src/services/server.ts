import express from "express"
import cookieParser from "cookie-parser"
import userRouter from "../routes/user.routes"

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use("/user", userRouter)

app.listen(3000, () => console.log("Server running on port 3000"))
