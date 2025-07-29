import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { processCalendarQuery } from '@/lib/aws-bedrock'
import { 
  getTodayEvents, 
  getWeekEvents, 
  createCalendarEvent,
  getCalendarEvents 
} from '@/lib/google-calendar'
import { 
  checkGroupAvailability, 
  findOptimalMeetingTime 
} from '@/lib/calendar-availability'
import { extractDateFromText, extractTimeFromText } from '@/lib/utils'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { message, conversationHistory = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get calendar data for context
    let calendarData = {}
    
    try {
      const todayEvents = await getTodayEvents(session.accessToken)
      const weekEvents = await getWeekEvents(session.accessToken)
      
      calendarData = {
        today: todayEvents,
        thisWeek: weekEvents,
        totalToday: todayEvents.length,
        totalThisWeek: weekEvents.length
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      // Continue without calendar data if there's an error
    }

    // Process the message with AI, including conversation history
    const aiResponse = await processCalendarQuery(message, calendarData, conversationHistory)

    // Check if the AI response indicates an action to take
    const lowerResponse = aiResponse.toLowerCase()
    
    let action = null
    let actionData = null
    let eventData = null
    let availabilityData = null

    // Extract availability check request from AI response
    const availabilityMatch = aiResponse.match(/AVAILABILITY_CHECK:\s*({.*?})/s)
    if (availabilityMatch) {
      try {
        availabilityData = JSON.parse(availabilityMatch[1])
        action = 'check_availability'
        
        // Process availability check
        const availabilityResult = await handleAvailabilityCheck(availabilityData, session.accessToken)
        
        actionData = {
          availabilityRequest: availabilityData,
          availabilityResult,
          message,
          aiResponse: aiResponse.replace(/AVAILABILITY_CHECK:\s*{.*?}/s, '').trim()
        }
      } catch (error) {
        console.error('Error processing availability check:', error)
      }
    }

    // Extract event data from AI response if present
    const eventDataMatch = aiResponse.match(/EVENT_DATA:\s*({.*?})/s)
    if (eventDataMatch && !availabilityData) {
      try {
        eventData = JSON.parse(eventDataMatch[1])
        action = 'create_event'
        actionData = {
          eventData,
          message,
          aiResponse: aiResponse.replace(/EVENT_DATA:\s*{.*?}/s, '').trim()
        }
      } catch (error) {
        console.error('Error parsing event data:', error)
      }
    }

    // Fallback: Check for event creation intent using basic text analysis
    if (!action && (lowerResponse.includes('create') || lowerResponse.includes('schedule') || lowerResponse.includes('add'))) {
      const date = extractDateFromText(message)
      const time = extractTimeFromText(message)
      
      if (date) {
        action = 'create_event'
        actionData = {
          date,
          time,
          message,
          aiResponse
        }
      }
    }

    // Check for event viewing intent
    if (!action && (lowerResponse.includes('show') || lowerResponse.includes('what') || lowerResponse.includes('events'))) {
      if (message.toLowerCase().includes('today')) {
        action = 'view_today'
      } else if (message.toLowerCase().includes('week')) {
        action = 'view_week'
      }
    }

    return NextResponse.json({
      response: actionData?.aiResponse || aiResponse,
      action,
      actionData,
      calendarData
    })

  } catch (error) {
    console.error('Error processing chat message:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

async function handleAvailabilityCheck(availabilityData, accessToken) {
  try {
    const { action, emails, duration, preferences } = availabilityData
    
    switch (action) {
      case 'find_optimal_time':
        const suggestions = await findOptimalMeetingTime(emails, duration, preferences, accessToken)
        return {
          type: 'optimal_time',
          suggestions: suggestions?.slice(0, 5) || [],
          totalFound: suggestions?.length || 0,
          emails,
          duration
        }
      
      case 'check_group':
        const { startTime, endTime } = availabilityData
        const availability = await checkGroupAvailability(emails, startTime, endTime, accessToken)
        return {
          type: 'group_availability',
          availability,
          emails,
          timeSlot: { startTime, endTime }
        }
      
      default:
        return {
          type: 'unknown',
          error: 'Unknown availability action'
        }
    }
  } catch (error) {
    console.error('Error in availability check:', error)
    return {
      type: 'error',
      error: error.message
    }
  }
} 