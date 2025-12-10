import { Router } from "express"
import { getNearbyScanUsers } from "../Socket/handlers/locationHandler"
import { authMiddleware } from "../middleware/auth.middleware"

const scanRouter = Router()

scanRouter.get("/nearby", authMiddleware, getNearbyScanUsers)

export default scanRouter
