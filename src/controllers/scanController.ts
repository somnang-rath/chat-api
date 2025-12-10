// src/socket/handlers/locationHandler.ts
import { Server } from "socket.io"
import { PrismaClient } from "@prisma/client"
import getDistance from "../utils/getDistance"
import getAngle from "../utils/getAngle"

const prisma = new PrismaClient()

export const scanController = (io: Server, socket: any) => {
  const userId = socket.data.user?.id
  if (!userId) return

  console.log("🟢 Connected:", userId)

  // ------------ user scans ------------
  socket.on("scan-event", async (data, cb) => {
    const { lat, lon, scan } = data

    await prisma.scanLocation.upsert({
      where: { userId },
      update: { scan, latitude: lat, longitude: lon },
      create: { userId, scan, latitude: lat, longitude: lon },
    })

    const nearby = await getNearby(userId)
    console.log("Nearby users for", nearby)
    // 🔥 broadcast to others (real-time)
    socket.broadcast.emit("scan-update", {
      nearby,
    })

    cb && cb({ ok: true, nearbyUsers: nearby })
  })

  socket.on("scan-update", async (data, cb) => {
    if (!data) {
      return cb && cb({ ok: false, error: "invalid_groupId" })
    }

    try {
      await prisma.scanLocation.deleteMany({
        where: {
          userId: userId,
        },
      })
      const nearby = await getNearby(userId)

      // broadcast remove marker
      socket.broadcast.emit("scan-update", {
        nearby,
      })
      console.log("Scan location removed for user:", userId)
      cb && cb({ ok: true })
    } catch (err) {
      console.error("Error unpin:", err)
      cb && cb({ ok: false })
    }
  })
  // ------------ disconnect -------------
  socket.on("disconnect", async () => {
    const userId = socket.data.user?.id
    if (!userId) return

    await prisma.scanLocation.upsert({
      where: { userId },
      update: { scan: false },
      create: {
        userId,
        scan: false,
        latitude: null,
        longitude: null,
      },
    })

    console.log("🔴 Disconnected:", userId)
  })
}

// helper
async function getNearby(meId: string) {
  const all = await prisma.scanLocation.findMany({
    where: { scan: true },
    include: { user: true },
  })
  const me = all.find((u) => u.userId === meId)
  if (!me) return []

  return all
    .filter((u) => u.userId !== meId)
    .map((u) => ({
      id: u.userId,
      name: u.user.firstName + " " + u.user.lastName,
      avatar: u.user.avatar,
      distance: getDistance(
        me.latitude!,
        me.longitude!,
        u.latitude!,
        u.longitude!
      ),
      angle: getAngle(me.latitude!, me.longitude!, u.latitude!, u.longitude!),
    }))
    .filter((u) => u.distance <= 20)
}
