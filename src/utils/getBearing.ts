export default function getBearing(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const toDeg = (x) => (x * 180) / Math.PI

  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const λ1 = toRad(lon1)
  const λ2 = toRad(lon2)

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1)

  let brng = toDeg(Math.atan2(y, x))
  brng = (brng + 360) % 360 // normalize
  return brng
}
