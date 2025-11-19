import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import {
  ACCESS_SECRET,
  REFRESH_SECRET,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
} from "../config/jwt"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function registerUser(req: Request, res: Response) {
  try {
    const { firstName, lastName, phone, email, password } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        passwordHash,
      },
    })

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES }
    )

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES }
    )

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    const { passwordHash: _, ...safeUser } = user

    return res.status(201).json({
      message: "User created successfully",
      user: safeUser,
      accessToken,
    })
  } catch (error) {
    console.log("Controller ERROR:", error)
    return res.status(500).json({ message: "Server error" })
  }
}
