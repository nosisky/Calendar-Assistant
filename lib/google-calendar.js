import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

function getAuthClient(accessToken) {
  const auth = new google.auth.OAuth2()
  auth.setCredentials({
    access_token: accessToken,
  })
  return auth
}

export async function getCalendarEvents(timeMin, timeMax, accessToken) {
  try {
    const auth = getAuthClient(accessToken)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })
    
    return response.data.items || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    throw new Error('Failed to fetch calendar events')
  }
}

export async function createCalendarEvent(eventData, accessToken) {
  try {
    const auth = getAuthClient(accessToken)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      attendees: eventData.attendees?.map(email => ({ email })) || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    }
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      sendUpdates: 'all',
    })
    
    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw new Error('Failed to create calendar event')
  }
}

export async function updateCalendarEvent(eventId, eventData, accessToken) {
  try {
    const auth = getAuthClient(accessToken)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startTime,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      end: {
        dateTime: eventData.endTime,
        timeZone: eventData.timeZone || 'America/New_York',
      },
      attendees: eventData.attendees?.map(email => ({ email })) || [],
    }
    
    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event,
      sendUpdates: 'all',
    })
    
    return response.data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw new Error('Failed to update calendar event')
  }
}

export async function deleteCalendarEvent(eventId, accessToken) {
  try {
    const auth = getAuthClient(accessToken)
    const calendar = google.calendar({ version: 'v3', auth })
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all',
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw new Error('Failed to delete calendar event')
  }
}

export async function getTodayEvents(accessToken) {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
  
  return await getCalendarEvents(startOfDay, endOfDay, accessToken)
}

export async function getWeekEvents(accessToken) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  
  return await getCalendarEvents(startOfWeek, endOfWeek, accessToken)
} 