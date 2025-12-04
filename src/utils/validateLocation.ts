// src/utils/validateLocation.js
export function validateLocationPayload(data) {
  if (!data) return false
  const { latitude, longitude, ts } = data

  if (typeof latitude !== "number" || typeof longitude !== "number")
    return false
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    return false

  if (typeof ts !== "number") return false
  // freshness: within 30 seconds
  if (Math.abs(Date.now() - ts) > 30 * 1000) return false

  return true
}

export function sanitizeAndRound(data, decimals = 6) {
  const lat =
    Math.round(data.latitude * Math.pow(10, decimals)) / Math.pow(10, decimals)
  const lng =
    Math.round(data.longitude * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return { latitude: lat, longitude: lng, ts: data.ts }
}
