import express from "express"
import {
  create1v1,
  createGroup,
  sendMessage,
  getMessages,
  getUserChats,
} from "../controllers/chatController"
import { authMiddleware } from "../middleware/auth.middleware"

const chatRouter = express.Router()

chatRouter.post("/one", authMiddleware, create1v1)
chatRouter.post("/group", authMiddleware, createGroup)
chatRouter.post("/message", authMiddleware, sendMessage)
chatRouter.get("/messages/:chatId", authMiddleware, getMessages)
chatRouter.get("/getUser", authMiddleware, getUserChats)

export default chatRouter
