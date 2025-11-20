import jwt from "jsonwebtoken"
import { ACCESS_SECRET } from "../config/jwt"

export const authMiddleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET)
    console.log("🔥 DECODED TOKEN =", decoded) // <-- ADD THIS
    req.user = decoded
    next()
  } catch (error) {
    console.log("JWT ERROR:", error)
    return res.status(401).json({ message: "Invalid or expired token" })
  }
}
