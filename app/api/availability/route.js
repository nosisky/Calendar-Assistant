import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { 
  checkFreeBusy, 
  checkGroupAvailability, 
  findOptimalMeetingTime,
  checkMultiPlatformAvailability 
} from '@/lib/calendar-availability'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, ...params } = await request.json()

    switch (action) {
      case 'check_single':
        return await handleSingleAvailability(params, session.accessToken)
      
      case 'check_group':
        return await handleGroupAvailability(params, session.accessToken)
      
      case 'find_optimal_time':
        return await handleOptimalTime(params, session.accessToken)
      
      case 'check_multi_platform':
        return await handleMultiPlatform(params)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Availability check error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

async function handleSingleAvailability(params, accessToken) {
  const { email, startTime, endTime } = params
  
  if (!email || !startTime || !endTime) {
    return NextResponse.json(
      { error: 'Missing required parameters: email, startTime, endTime' },
      { status: 400 }
    )
  }

  const result = await checkFreeBusy(email, startTime, endTime, accessToken)
  
  return NextResponse.json({
    success: true,
    availability: result,
    message: result.isAvailable 
      ? `${email} is available` 
      : `${email} has ${result.conflicts?.length || 0} conflict(s)`
  })
}

async function handleGroupAvailability(params, accessToken) {
  const { emails, startTime, endTime } = params
  
  if (!emails || !Array.isArray(emails) || !startTime || !endTime) {
    return NextResponse.json(
      { error: 'Missing required parameters: emails (array), startTime, endTime' },
      { status: 400 }
    )
  }

  const availability = await checkGroupAvailability(emails, startTime, endTime, accessToken)
  
  if (!availability) {
    return NextResponse.json(
      { error: 'Failed to check group availability' },
      { status: 500 }
    )
  }

  // Calculate summary statistics
  const totalAttendees = emails.length
  const availableAttendees = Object.values(availability).filter(a => a.isAvailable).length
  const conflictsCount = Object.values(availability).reduce((sum, a) => sum + a.conflicts, 0)

  return NextResponse.json({
    success: true,
    availability,
    summary: {
      totalAttendees,
      availableAttendees,
      conflictsCount,
      canSchedule: availableAttendees === totalAttendees
    },
    message: availableAttendees === totalAttendees 
      ? 'All attendees are available'
      : `${totalAttendees - availableAttendees} attendee(s) have conflicts`
  })
}

async function handleOptimalTime(params, accessToken) {
  const { emails, duration = 60, preferences = {} } = params
  
  if (!emails || !Array.isArray(emails)) {
    return NextResponse.json(
      { error: 'Missing required parameter: emails (array)' },
      { status: 400 }
    )
  }

  const suggestions = await findOptimalMeetingTime(emails, duration, preferences, accessToken)
  
  if (!suggestions || suggestions.length === 0) {
    return NextResponse.json({
      success: true,
      suggestions: [],
      message: 'No available time slots found for all attendees'
    })
  }

  return NextResponse.json({
    success: true,
    suggestions: suggestions.slice(0, 5), // Return top 5 suggestions
    totalFound: suggestions.length,
    message: `Found ${suggestions.length} available time slot(s)`
  })
}

async function handleMultiPlatform(params) {
  const { attendees, timeSlot } = params
  
  if (!attendees || !Array.isArray(attendees) || !timeSlot) {
    return NextResponse.json(
      { error: 'Missing required parameters: attendees (array), timeSlot' },
      { status: 400 }
    )
  }

  const results = await checkMultiPlatformAvailability(attendees, timeSlot)
  
  return NextResponse.json({
    success: true,
    availability: results,
    message: 'Multi-platform availability checked'
  })
}

// GET endpoint for simple availability queries
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')

    if (!email || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required query parameters: email, startTime, endTime' },
        { status: 400 }
      )
    }

    const result = await checkFreeBusy(email, startTime, endTime, session.accessToken)
    
    return NextResponse.json({
      success: true,
      availability: result
    })
  } catch (error) {
    console.error('GET availability error:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
} 