"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = registerUser;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../config/jwt");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function registerUser(req, res) {
    try {
        const { firstName, lastName, phone, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                phone: phone || null,
                passwordHash,
            },
        });
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwt_1.ACCESS_SECRET, { expiresIn: jwt_1.ACCESS_EXPIRES });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, jwt_1.REFRESH_SECRET, { expiresIn: jwt_1.REFRESH_EXPIRES });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const { passwordHash: _, ...safeUser } = user;
        return res.status(201).json({
            message: "User created successfully",
            user: safeUser,
            accessToken,
        });
    }
    catch (error) {
        console.log("Controller ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
