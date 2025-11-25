import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// --------------------
// Create 1 vs 1 Chat
// --------------------
export const create1v1 = async (req, res) => {
  try {
    const userId = req.user?.id

    // ✅ កែត្រឹមត្រូវ៖ ពិនិត្យលក្ខខណ្ឌនឹងតម្លៃពិត
    if (!userId) {
      console.log("❌ Unauthorized: No user ID found")
      return res.status(401).json({ message: "Unauthorized" })
    }

    // ពិនិត្យ request body
    const { userId: targetUserId } = req.body
    console.log("🎯 Target User ID:", targetUserId)

    if (!targetUserId) {
      return res.status(400).json({ message: "userId required" })
    }

    if (targetUserId === userId) {
      return res.status(400).json({ message: "Cannot chat with yourself" })
    }

    console.log(
      "🔍 Finding existing chat between:",
      userId,
      "and",
      targetUserId
    )

    // Find existing 1v1 chat
    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        members: {
          every: {
            userId: {
              in: [userId, targetUserId],
            },
          },
        },
      },
      include: {
        members: {
          include: {
            user: true, // បើចង់បានព័ត៌មាន user ពេញ
          },
        },
      },
    })

    console.log("📊 Existing chat found:", !!chat)

    // Create new 1v1 chat if not exists
    if (!chat) {
      console.log("🆕 Creating new chat...")
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          members: {
            create: [{ userId: userId }, { userId: targetUserId }],
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      })
    }

    res.json(chat)
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message })
  }
}

// --------------------
// Create Group Chat
// --------------------
export const createGroup = async (req: Request, res: Response) => {
  try {
    const { name, members } = req.body

    if (!req.userId) return res.status(401).json({ message: "Unauthorized" })
    if (!name) return res.status(400).json({ message: "Group name required" })
    if (!Array.isArray(members) || members.length < 1)
      return res.status(400).json({ message: "At least 1 member required" })

    const chat = await prisma.chat.create({
      data: {
        name,
        isGroup: true,
        members: {
          create: [
            { userId: req.userId, isAdmin: true },
            ...members.map((id: string) => ({ userId: id })),
          ],
        },
      },
      include: { members: true },
    })

    res.json(chat)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err })
  }
}

// --------------------
// Send Message
// --------------------
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body
    const userId = req.user.id // correct

    console.log("userId", userId)

    if (!userId) return res.status(401).json({ message: "Unauthorized" })
    if (!chatId || !text)
      return res.status(400).json({ message: "chatId and text required" })

    const msg = await prisma.message.create({
      data: {
        chatId,
        senderId: userId, // ✅ FIX HERE
        text,
      },
      include: { sender: true },
    })

    res.json(msg)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err })
  }
}

// --------------------
// Get Chat Messages
// --------------------
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params

    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: { id: true, firstName: true, avatar: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    res.json(messages)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Server error", details: err })
  }
}

export const getUserChats = async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
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
        messages: {
          take: 1, // last message
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    res.json(chats)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching chats" })
  }
}
