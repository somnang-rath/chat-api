export default function getDirectionText(deg: number): string {
  if (deg >= 45 && deg < 135) return "East"
  if (deg >= 135 && deg < 225) return "South"
  if (deg >= 225 && deg < 315) return "West"
  return "North"
}
