// src/utils/rateLimitMap.js
const lastSentAt = new Map()

export function canSend(userId, minIntervalMs = 1000) {
  const now = Date.now()
  const last = lastSentAt.get(userId) || 0
  if (now - last < minIntervalMs) return false
  lastSentAt.set(userId, now)
  return true
}
