export default function getDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const y = Math.sin(lon2 - lon1) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1)
  let brng = Math.atan2(y, x)
  brng = (brng * 180) / Math.PI
  return (brng + 360) % 360
}
