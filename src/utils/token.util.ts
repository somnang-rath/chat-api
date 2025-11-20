// utils/token.util.js
import jwt from "jsonwebtoken"
import {
  ACCESS_EXPIRES,
  ACCESS_SECRET,
  REFRESH_EXPIRES,
  REFRESH_SECRET,
} from "../config/jwt"

export const createAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  })
}

export const createRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  })
}

export const sendRefreshToken = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false, // change to true if using https in production
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}
