// src/routes/chat.routes.ts
import { Router } from "express"
import { PrismaClient } from "@prisma/client"

const routerPoint = Router()
const prisma = new PrismaClient()

routerPoint.get("/:chatId", async (req, res) => {
  try {
    const points = await prisma.latestPoint.findMany({
      where: { chatId: req.params.chatId },
    })

    // if no points
    if (!points || points.length === 0) {
      return res.json({ ok: true, points: [] })
    }

    // Convert each point (Array.map)
    const converted = points.map((p) => ({
      ...p,
      ts: p.ts ? Number(p.ts) : null,
    }))

    return res.json({ ok: true, points: converted })
  } catch (err) {
    console.error("GET /point error:", err)
    return res.status(500).json({ ok: false, error: "server_error" })
  }
})

export default routerPoint
