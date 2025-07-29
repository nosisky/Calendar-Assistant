import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, addDays, startOfDay, setHours, setMinutes, isValid, parse } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MMM dd, yyyy')
  } catch (error) {
    return ''
  }
}

export function formatTime(date) {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'h:mm a')
  } catch (error) {
    return ''
  }
}

export function formatDateTime(date) {
  if (!date) return ''
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, 'MMM dd, yyyy h:mm a')
  } catch (error) {
    return ''
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function extractDateFromText(text) {
  const today = new Date()
  const lowerText = text.toLowerCase()
  
  // Handle relative dates
  if (lowerText.includes('today')) {
    return format(today, 'yyyy-MM-dd')
  }
  
  if (lowerText.includes('tomorrow')) {
    return format(addDays(today, 1), 'yyyy-MM-dd')
  }
  
  if (lowerText.includes('next week')) {
    return format(addDays(today, 7), 'yyyy-MM-dd')
  }
  
  // Handle day names
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  for (const day of days) {
    if (lowerText.includes(day)) {
      const dayIndex = days.indexOf(day)
      const currentDay = today.getDay()
      const daysUntilTarget = (dayIndex + 1 - currentDay + 7) % 7 || 7
      return format(addDays(today, daysUntilTarget), 'yyyy-MM-dd')
    }
  }
  
  // Handle specific date patterns (MM/DD, MM-DD, MM/DD/YYYY, etc.)
  const datePatterns = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,  // MM/DD/YYYY or MM-DD-YYYY
    /(\d{1,2})[\/\-](\d{1,2})/,               // MM/DD or MM-DD
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/   // YYYY/MM/DD or YYYY-MM-DD
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        let year, month, day
        if (match[3]) { // Has year
          if (match[0].startsWith(match[3])) { // YYYY-MM-DD format
            [, year, month, day] = match
          } else { // MM/DD/YYYY format
            [, month, day, year] = match
          }
        } else { // No year, assume current year
          [, month, day] = match
          year = today.getFullYear()
        }
        
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        if (isValid(date)) {
          return format(date, 'yyyy-MM-dd')
        }
      } catch (error) {
        continue
      }
    }
  }
  
  return null
}

export function extractTimeFromText(text) {
  const timePatterns = [
    /(\d{1,2}):(\d{2})\s*(am|pm)/i,           // 2:30 PM
    /(\d{1,2})\s*(am|pm)/i,                   // 2 PM
    /(\d{1,2}):(\d{2})/,                      // 14:30 (24-hour)
    /at\s+(\d{1,2}):?(\d{2})?\s*(am|pm)?/i    // at 2:30 PM or at 2 PM
  ]
  
  for (const pattern of timePatterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        let hours = parseInt(match[1])
        let minutes = parseInt(match[2]) || 0
        const period = match[3]?.toLowerCase()
        
        if (period === 'pm' && hours !== 12) {
          hours += 12
        } else if (period === 'am' && hours === 12) {
          hours = 0
        }
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      } catch (error) {
        continue
      }
    }
  }
  
  return null
}

export function parseNaturalDateTime(text) {
  const date = extractDateFromText(text)
  const time = extractTimeFromText(text)
  
  if (!date) return null
  
  try {
    let dateTime = startOfDay(parseISO(date))
    
    if (time) {
      const [hours, minutes] = time.split(':').map(Number)
      dateTime = setHours(setMinutes(dateTime, minutes), hours)
    } else {
      // Default to 9 AM if no time specified
      dateTime = setHours(dateTime, 9)
    }
    
    return dateTime.toISOString()
  } catch (error) {
    return null
  }
}

export function extractEmailsFromText(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  return text.match(emailRegex) || []
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
} 