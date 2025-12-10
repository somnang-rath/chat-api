import { Router } from "express"
import userController from "../controllers/UserController"
import { authMiddleware } from "../middleware/auth.middleware"

const userRouter = Router()

// Register user
userRouter.post("/register", userController.registerUser)

// Login user
userRouter.post("/login", userController.loginUser)
// Update user
userRouter.get("/profile", authMiddleware, userController.getProfile)

// Get user by ID
userRouter.get("/:id", userController.getUserById)

userRouter.post("/updateProfile", authMiddleware, userController.updateProfile)

userRouter.post("/search", authMiddleware, userController.searchUser)

// // Delete user
// userRouter.delete("/:id", userController.deleteUser)

export default userRouter
