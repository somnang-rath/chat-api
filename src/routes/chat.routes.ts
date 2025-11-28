// src/routes/chat.routes.ts
import { Router } from "express"
import * as chatCtrl from "../controllers/chatController"
import { authMiddleware } from "../middleware/auth.middleware"
// import auth middleware to populate req.user

const router = Router()

router.post("/create1v1", authMiddleware, chatCtrl.create1v1)
router.post("/createGroup", authMiddleware, chatCtrl.createGroup)
router.post("/send", authMiddleware, chatCtrl.sendMessage)
router.get("/messages/:chatId", authMiddleware, chatCtrl.getMessages)
router.get("/getUser", authMiddleware, chatCtrl.getUserChats)

export default router
