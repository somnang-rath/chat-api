// src/socket/handlers/locationHandler.ts
import { Server } from "socket.io"
import { validateLocationPayload } from "../utils/validateLocation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
export const handleLocationEvents = (io: Server, socket: any) => {
  const user = socket.data.user

  // Join group
  socket.on("join-group", (chatId, cb) => {
    const groupRoom = `group_${chatId}`
    socket.join(groupRoom)
    cb && cb({ ok: true })
    console.log(`User ${user.id} joined ${groupRoom}`)
  })

  // Real-time device location
  socket.on("send-myLocation", (data, cb) => {
    if (!validateLocationPayload(data)) {
      console.error(`Invalid payload from user ${user.id}:`, data)
      return cb && cb({ ok: false, error: "invalid_payload" })
    }

    const groupRoom = `group_${data.groupId}`
    const loc = {
      userId: user.id,
      latitude: data.latitude,
      longitude: data.longitude,
      ts: data.ts,
    }

    //  group (exclude sender)
    socket.to(groupRoom).emit("update-myLocation", loc)
    console.log(`Location update from ${user.id} to ${groupRoom}:`, loc)

    cb && cb({ ok: true })
  })

  // Point (selected marker)
  socket.on("send-point", async (data, cb) => {
    if (
      !data ||
      !data.groupId ||
      !data.point ||
      typeof data.point.latitude !== "number" ||
      typeof data.point.longitude !== "number"
    ) {
      console.error(`Invalid point from user ${user.id}:`, data)
      return cb && cb({ ok: false, error: "invalid_point" })
    }

    const groupRoom = `group_${data.groupId}`
    const p = {
      userId: user.id,
      point: { latitude: data.point.latitude, longitude: data.point.longitude },
    }
    try {
      // Save or update latest point
      await prisma.latestPoint.upsert({
        where: {
          userId_chatId: {
            userId: user.id,
            chatId: data.groupId,
          },
        },
        update: {
          latitude: data.point.latitude,
          longitude: data.point.longitude,
          ts: BigInt(Date.now()),
        },
        create: {
          userId: user.id,
          chatId: data.groupId,
          latitude: data.point.latitude,
          longitude: data.point.longitude,
          ts: BigInt(Date.now()),
        },
      })

      // Broadcast to group (exclude sender)
      socket.to(groupRoom).emit("update-point", p)

      cb && cb({ ok: true })
      console.log("Point saved & emitted:", p)
    } catch (err) {
      console.error("Error saving point:", err)
      cb?.({ ok: false })
    }

    // socket.to(groupRoom).emit("update-point", p)
    // console.log(`Point update from ${user.id} to ${groupRoom}:`, p)

    // cb && cb({ ok: true })
  })
}
