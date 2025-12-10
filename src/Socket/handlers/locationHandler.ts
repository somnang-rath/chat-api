import { PrismaClient } from "@prisma/client"
import getDistance from "../../utils/getDistance"
const prisma = new PrismaClient()
export const getNearbyScanUsers = async (req, res) => {
  try {
    const userId = req.user.id

    if (!userId) {
      return res.status(400).json({ ok: false, error: "userId_required" })
    }

    // get only scan active
    const allLocations = await prisma.scanLocation.findMany({
      where: { scan: true },
    })

    const me = allLocations.find((u) => u.userId === userId)

    if (!me) {
      return res.json({ ok: true, nearbyUsers: [] }) // no scan location yet
    }

    const nearby = allLocations.filter((u) => {
      if (u.userId === userId) return false
      const d = getDistance(
        me.latitude!,
        me.longitude!,
        u.latitude!,
        u.longitude!
      )
      return d <= 20
    })

    res.json({
      ok: true,
      me: {
        userId: me.userId,
        lat: me.latitude,
        lon: me.longitude,
      },
      nearbyUsers: nearby.map((u) => ({
        userId: u.userId,
        distance: getDistance(
          me.latitude!,
          me.longitude!,
          u.latitude!,
          u.longitude!
        ),
      })),
    })
  } catch (err) {
    console.error("getNearbyScanUsers error:", err)
    res.status(500).json({ ok: false, error: "server_error" })
  }
}
