import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { 
  getTodayEvents, 
  getWeekEvents, 
  createCalendarEvent,
  getCalendarEvents 
} from '@/lib/google-calendar'

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
    const type = searchParams.get('type')
    const start = searchParams.get('start')
    const end = searchParams.get('end')

    let events = []

    switch (type) {
      case 'today':
        events = await getTodayEvents(session.accessToken)
        break
      case 'week':
        events = await getWeekEvents(session.accessToken)
        break
      case 'range':
        if (start && end) {
          events = await getCalendarEvents(new Date(start), new Date(end), session.accessToken)
        }
        break
      default:
        events = await getTodayEvents(session.accessToken)
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const eventData = await request.json()

    if (!eventData.summary || !eventData.startTime || !eventData.endTime) {
      return NextResponse.json(
        { error: 'Missing required event data' },
        { status: 400 }
      )
    }

    const createdEvent = await createCalendarEvent(eventData, session.accessToken)

    return NextResponse.json({ 
      success: true, 
      event: createdEvent 
    })
  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
} 