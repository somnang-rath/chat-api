import { PrismaClient } from "@prisma/client"
import { comparePassword, hashPassword } from "../utils/password.util"
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../utils/token.util"

const prisma = new PrismaClient()
const User = prisma.user

class UserController {
  /**
   *
   * @param {object} req
   * @param {object} res
   */

  async registerUser(req, res) {
    try {
      const { firstName, lastName, phone, email, password } = req.body

      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: "Missing required fields" })
      }

      const existing = await User.findUnique({ where: { email } })
      if (existing) {
        return res.status(400).json({ message: "Email already exists" })
      }

      const passwordHash = await hashPassword(password)

      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          phone: phone || null,
          passwordHash,
        },
      })

      const accessToken = createAccessToken({ id: user.id })
      const refreshToken = createRefreshToken({ id: user.id })
      sendRefreshToken(res, refreshToken)

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

  async loginUser(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" })
      }

      const user = await User.findUnique({
        where: { email },
      })

      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" })
      }

      const match = await comparePassword(password, user.passwordHash)
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" })
      }

      const accessToken = createAccessToken({ id: user.id })
      const refreshToken = createRefreshToken({ id: user.id })
      sendRefreshToken(res, refreshToken)

      const { passwordHash: _, ...safeUser } = user

      return res.status(200).json({
        message: "Login successful",
        user: safeUser,
        accessToken,
      })
    } catch (error) {
      console.log("LOGIN ERROR:", error)
      return res.status(500).json({ message: "Server error" })
    }
  }

  async getUserById(req, res) {
    try {
      const id = req.params.id

      const user = await User.findUnique({
        where: { id },
      })

      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      return res.status(200).json(user)
    } catch (error) {
      console.log("GET USER ERROR:", error)
      return res.status(500).json({ message: "Server error" })
    }
  }

  async getProfile(req, res) {
    try {
      const userId = req.user.id

      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) return res.status(404).json({ message: "User not found" })

      res.json(user)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const userController = new UserController()
export default userController
