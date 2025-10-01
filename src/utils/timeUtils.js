/**
 * Convert time string to minutes since midnight
 * Handles both AM/PM and 24-hour formats consistently
 *
 * @param {string} timeStr - Time string in format "H:MM AM/PM" or "HH:MM"
 * @returns {number} - Minutes since midnight
 */
export const timeToMinutes = timeStr => {
  if (!timeStr || typeof timeStr !== 'string') return 0

  // Handle AM/PM format (e.g., "1:15 PM", "11:30 AM")
  const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10)
    const minutes = parseInt(ampmMatch[2], 10)
    const period = ampmMatch[3].toUpperCase()
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12
    } else if (period === 'AM' && hours === 12) {
      hours = 0
    }
    
    return hours * 60 + minutes
  }

  // Handle 24-hour format
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/)
  if (!timeMatch) return 0

  const hours = parseInt(timeMatch[1], 10)
  const minutes = parseInt(timeMatch[2], 10)

  // Validate hours and minutes
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return 0

  return hours * 60 + minutes
}

/**
 * Check if two time ranges overlap
 *
 * @param {string} start1 - Start time of first range
 * @param {string} end1 - End time of first range
 * @param {string} start2 - Start time of second range
 * @param {string} end2 - End time of second range
 * @returns {boolean} - True if ranges overlap
 */
export const timeRangesOverlap = (start1, end1, start2, end2) => {
  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  // Check if ranges overlap: start1 < end2 && start2 < end1
  return start1Min < end2Min && start2Min < end1Min
}

/**
 * Format minutes since midnight to time string
 *
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Formatted time string
 */
export const minutesToTime = minutes => {
  if (minutes < 0 || minutes >= 24 * 60) return '00:00'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
