import { google } from 'googleapis'

// Free/Busy API - Shows availability without private details
export async function checkFreeBusy(email, startTime, endTime, accessToken) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    
    const calendar = google.calendar({ version: 'v3', auth })
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        items: [{ id: email }], // Can check multiple emails
        timeZone: 'UTC'
      }
    })
    
    const busyTimes = response.data.calendars[email]?.busy || []
    
    return {
      email,
      isAvailable: busyTimes.length === 0,
      busySlots: busyTimes,
      conflicts: busyTimes.map(slot => ({
        start: slot.start,
        end: slot.end,
        // No private details - just blocked time
      }))
    }
  } catch (error) {
    console.error('Error checking free/busy:', error)
    return {
      email,
      isAvailable: null, // Unknown availability
      error: error.message
    }
  }
}

// Check multiple people's availability at once
export async function checkGroupAvailability(emails, startTime, endTime, accessToken) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    
    const calendar = google.calendar({ version: 'v3', auth })
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime,
        timeMax: endTime,
        items: emails.map(email => ({ id: email })),
        timeZone: 'UTC'
      }
    })
    
    const availability = {}
    
    emails.forEach(email => {
      const busyTimes = response.data.calendars[email]?.busy || []
      availability[email] = {
        isAvailable: busyTimes.length === 0,
        busySlots: busyTimes,
        conflicts: busyTimes.length
      }
    })
    
    return availability
  } catch (error) {
    console.error('Error checking group availability:', error)
    return null
  }
}

// Find optimal meeting time for multiple people
export async function findOptimalMeetingTime(emails, duration, preferences, accessToken) {
  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 14) // Check next 2 weeks
    
    const availability = await checkGroupAvailability(
      emails, 
      startDate.toISOString(), 
      endDate.toISOString(), 
      accessToken
    )
    
    if (!availability) return null
    
    // Algorithm to find best times
    const suggestions = findBestTimeSlots(availability, duration, preferences)
    
    return suggestions
  } catch (error) {
    console.error('Error finding optimal time:', error)
    return null
  }
}

// Smart algorithm to find best meeting times
function findBestTimeSlots(availability, durationMinutes, preferences = {}) {
  const {
    preferredHours = { start: 9, end: 17 }, // 9 AM to 5 PM
    timeZone = 'UTC',
    excludeWeekends = true,
    bufferMinutes = 15
  } = preferences
  
  const suggestions = []
  const emails = Object.keys(availability)
  
  // Generate time slots for the next 2 weeks
  const now = new Date()
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  
  for (let date = new Date(now); date <= twoWeeksLater; date.setDate(date.getDate() + 1)) {
    // Skip weekends if preferred
    if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
      continue
    }
    
    // Check each hour within preferred hours
    for (let hour = preferredHours.start; hour <= preferredHours.end - Math.ceil(durationMinutes / 60); hour++) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      
      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes)
      
      // Check if all attendees are available
      const isEveryoneAvailable = emails.every(email => {
        const busySlots = availability[email].busySlots
        return !busySlots.some(busy => {
          const busyStart = new Date(busy.start)
          const busyEnd = new Date(busy.end)
          
          // Check for overlap (with buffer)
          const bufferStart = new Date(slotStart.getTime() - bufferMinutes * 60000)
          const bufferEnd = new Date(slotEnd.getTime() + bufferMinutes * 60000)
          
          return (bufferStart < busyEnd && bufferEnd > busyStart)
        })
      })
      
      if (isEveryoneAvailable) {
        suggestions.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          score: calculateTimeScore(slotStart, preferences),
          attendees: emails.length,
          conflicts: 0
        })
      }
    }
  }
  
  // Sort by score (best times first)
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 10) // Return top 10 suggestions
}

// Score time slots based on preferences
function calculateTimeScore(dateTime, preferences) {
  let score = 100 // Base score
  
  const hour = dateTime.getHours()
  const day = dateTime.getDay()
  
  // Prefer mid-morning and early afternoon
  if (hour >= 10 && hour <= 11) score += 20 // 10-11 AM
  if (hour >= 14 && hour <= 15) score += 15 // 2-3 PM
  if (hour >= 9 && hour <= 9) score += 10   // 9-10 AM
  
  // Prefer Tuesday-Thursday
  if (day >= 2 && day <= 4) score += 10
  
  // Avoid early morning and late afternoon
  if (hour < 9 || hour > 16) score -= 20
  
  // Avoid Monday mornings and Friday afternoons
  if (day === 1 && hour < 11) score -= 15
  if (day === 5 && hour > 14) score -= 15
  
  return score
}

// Alternative: Invitation-based availability checking
export async function checkAvailabilityViaInvite(emails, proposedTimes, accessToken) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    
    const calendar = google.calendar({ version: 'v3', auth })
    
    const results = []
    
    for (const timeSlot of proposedTimes) {
      // Create a tentative event to check availability
      const event = {
        summary: 'Availability Check (Please Ignore)',
        start: { dateTime: timeSlot.start },
        end: { dateTime: timeSlot.end },
        attendees: emails.map(email => ({ 
          email, 
          responseStatus: 'needsAction' 
        })),
        transparency: 'transparent', // Doesn't block time
        visibility: 'private'
      }
      
      try {
        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: event,
          sendUpdates: 'none' // Don't send actual invites
        })
        
        // Immediately delete the test event
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: response.data.id
        })
        
        results.push({
          timeSlot,
          canSchedule: true,
          attendees: emails.length
        })
      } catch (error) {
        results.push({
          timeSlot,
          canSchedule: false,
          error: error.message
        })
      }
    }
    
    return results
  } catch (error) {
    console.error('Error checking availability via invite:', error)
    return null
  }
}

// Multi-platform availability (Google + Outlook + others)
export async function checkMultiPlatformAvailability(attendees, timeSlot) {
  const results = {}
  
  for (const attendee of attendees) {
    const { email, platform, accessToken } = attendee
    
    try {
      switch (platform) {
        case 'google':
          results[email] = await checkFreeBusy(
            email, 
            timeSlot.start, 
            timeSlot.end, 
            accessToken
          )
          break
          
        case 'outlook':
          results[email] = await checkOutlookAvailability(
            email, 
            timeSlot, 
            accessToken
          )
          break
          
        case 'apple':
          results[email] = await checkAppleCalendarAvailability(
            email, 
            timeSlot, 
            accessToken
          )
          break
          
        default:
          results[email] = {
            email,
            isAvailable: null,
            error: 'Unsupported platform'
          }
      }
    } catch (error) {
      results[email] = {
        email,
        isAvailable: null,
        error: error.message
      }
    }
  }
  
  return results
}

// Outlook/Exchange availability checking
async function checkOutlookAvailability(email, timeSlot, accessToken) {
  try {
    // Microsoft Graph API for Outlook
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/calendar/getSchedule`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        schedules: [email],
        startTime: {
          dateTime: timeSlot.start,
          timeZone: 'UTC'
        },
        endTime: {
          dateTime: timeSlot.end,
          timeZone: 'UTC'
        }
      })
    })
    
    const data = await response.json()
    const schedule = data.value[0]
    
    return {
      email,
      isAvailable: schedule.freeBusyStatus === 'free',
      busySlots: schedule.busyTimes || [],
      platform: 'outlook'
    }
  } catch (error) {
    return {
      email,
      isAvailable: null,
      error: error.message,
      platform: 'outlook'
    }
  }
}

// Apple Calendar availability (more limited)
async function checkAppleCalendarAvailability(email, timeSlot, accessToken) {
  // Apple Calendar doesn't have a public API like Google/Microsoft
  // This would require integration with CalDAV or other methods
  return {
    email,
    isAvailable: null,
    error: 'Apple Calendar API not available',
    platform: 'apple'
  }
} 