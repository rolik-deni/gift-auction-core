export const formatStars = (amount: string): string => `⭐️ ${amount}`

export const formatTimer = (seconds: number): string => {
    const safeSeconds = Math.max(0, Math.floor(seconds))
    const minutes = Math.floor(safeSeconds / 60)
    const rest = safeSeconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}
