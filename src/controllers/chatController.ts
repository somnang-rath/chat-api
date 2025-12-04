// src/controllers/chatController.ts
import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { io } from "../Socket/socket" // import the io instance

const prisma = new PrismaClient()

export const create1v1 = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { userId: targetUserId } = req.body
    if (!targetUserId)
      return res.status(400).json({ message: "userId required" })
    if (targetUserId === userId)
      return res.status(400).json({ message: "Cannot chat with yourself" })

    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        members: { every: { userId: { in: [userId, targetUserId] } } },
      },
      include: { members: { include: { user: true } } },
    })

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          members: { create: [{ userId }, { userId: targetUserId }] },
        },
        include: { members: { include: { user: true } } },
      })
    }

    res.json(chat)
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
}

export const createGroup = async (req: any, res: Response) => {
  try {
    const { name, members } = req.body
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" })
    if (!name) return res.status(400).json({ message: "Group name required" })
    if (!Array.isArray(members) || members.length < 1)
      return res.status(400).json({ message: "At least 1 member required" })

    const chat = await prisma.chat.create({
      data: {
        name,
        isGroup: true,
        members: {
          create: [
            { userId: req.user.id, isAdmin: true },
            ...members.map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: { members: true },
    })

    res.json(chat)
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
}

export const sendMessage = async (req: any, res: Response) => {
  try {
    const { chatId, text, receiverId } = req.body
    const senderId = req.user?.id
    if (!senderId) return res.status(401).json({ message: "Unauthorized" })
    if (!chatId || !text)
      return res.status(400).json({ message: "chatId and text required" })

    const msg = await prisma.message.create({
      data: { chatId, senderId, text },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          },
        },
      },
    })

    // find members of chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { members: true },
    })

    // Emit to chat room (for chat screen)
    if (io) io.to(chatId).emit("new_message", msg)

    // Emit to each user's personal room (for chat list update)
    if (chat?.members) {
      chat.members.forEach((m: any) => {
        if (io) io.to(m.userId).emit("new_message", { chatId, message: msg })
      })
    }

    res.json(msg)
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
}

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: { select: { id: true, firstName: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    })
    res.json(messages)
  } catch (err: any) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err.message })
  }
}

export const getUserChats = async (req: any, res: Response) => {
  try {
    const userId = req.user.id
    console.log("userId", userId)
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const chats = await prisma.chat.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        messages: { take: 1, orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    })

    res.json(chats)
  } catch (err: any) {
    console.log(err)
    res
      .status(500)
      .json({ message: "Error fetching chats", details: err.message })
  }
}
