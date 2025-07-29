'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Sparkles, Shield, RefreshCw, Send, Plus, CheckCircle, Menu, X, Users, CalendarCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Header from '@/components/layout/Header'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import CalendarView from '@/components/calendar/CalendarView'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SignInButton from '@/components/auth/SignInButton'
import toast from 'react-hot-toast'
import { formatDateTime, formatTime } from '@/lib/utils'

export default function Home() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const suggestions = [
    "What meetings do I have today?",
    "Schedule a call with john@example.com tomorrow at 2pm",
    "Show me this week's events",
    "Find a time when Sarah and Mike are both available next week"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const createCalendarEvent = async (eventData) => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event')
      }

      return data.event
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw error
    }
  }

  const renderAvailabilityResults = (availabilityResult) => {
    if (!availabilityResult) return null

    const { type, suggestions, availability, emails, duration, timeSlot } = availabilityResult

    if (type === 'optimal_time') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-800">
              Available Time Slots ({suggestions.length} found)
            </h4>
          </div>
          
          {suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((slot, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-md border border-green-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDateTime(slot.start)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {duration} minutes • {emails.length} attendees
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => scheduleAtTime(slot, emails, duration)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Schedule
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-green-700">
              No available time slots found for all attendees. Try adjusting your preferences or timeframe.
            </p>
          )}
        </motion.div>
      )
    }

    if (type === 'group_availability') {
      const availableCount = Object.values(availability).filter(a => a.isAvailable).length
      const totalCount = Object.keys(availability).length

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-800">
              Group Availability Check
            </h4>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-blue-700">
              Time: {formatDateTime(timeSlot.startTime)} - {formatTime(timeSlot.endTime)}
            </p>
            <p className="text-sm text-blue-700">
              {availableCount} of {totalCount} attendees available
            </p>
          </div>

          <div className="space-y-2">
            {Object.entries(availability).map(([email, info]) => (
              <div
                key={email}
                className={`flex items-center justify-between p-2 rounded-md ${
                  info.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                <span className="text-sm font-medium">{email}</span>
                <span className="text-xs">
                  {info.isAvailable ? '✅ Available' : `❌ ${info.conflicts} conflict(s)`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )
    }

    return null
  }

  const scheduleAtTime = async (timeSlot, attendees, duration) => {
    try {
      toast.loading('Scheduling meeting...', { id: 'schedule-meeting' })

      const eventData = {
        summary: `Meeting with ${attendees.join(', ')}`,
        startTime: timeSlot.start,
        endTime: timeSlot.end,
        attendees: attendees,
        description: `Scheduled via AI Calendar Assistant`
      }

      const createdEvent = await createCalendarEvent(eventData)
      
      toast.success(
        `Meeting scheduled successfully!`, 
        { id: 'schedule-meeting', duration: 4000 }
      )

      // Add success message to chat
      const successMessage = {
        id: `success-${Date.now()}`,
        content: `🎉 Meeting scheduled for ${formatDateTime(timeSlot.start)} with ${attendees.join(', ')}!`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])

    } catch (error) {
      toast.error(`Failed to schedule meeting: ${error.message}`, { id: 'schedule-meeting' })
    }
  }

  const handleSendMessage = async (message) => {
    if (!message.trim() || loading) return

    const userMessage = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      // Prepare conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10).map(msg => ({
        content: msg.content,
        isUser: msg.isUser
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          conversationHistory 
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`)
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        // Add availability results if present
        availabilityResult: data.actionData?.availabilityResult
      }

      setMessages(prev => [...prev, assistantMessage])

      // Handle calendar actions
      if (data.action === 'view_today' || data.action === 'view_week') {
        const events = data.calendarData?.today || data.calendarData?.thisWeek || []
        setCalendarEvents(events)
        setShowCalendar(true)
        if (events.length > 0) {
          toast.success(`Found ${events.length} event${events.length !== 1 ? 's' : ''}`)
        }
      }

      // Handle availability checking
      if (data.action === 'check_availability') {
        toast.success('Availability checked successfully!')
      }

      // Handle event creation
      if (data.action === 'create_event' && data.actionData?.eventData) {
        try {
          toast.loading('Creating calendar event...', { id: 'create-event' })
          
          const createdEvent = await createCalendarEvent(data.actionData.eventData)
          
          toast.success(
            `✅ Event "${createdEvent.summary}" created successfully!`, 
            { id: 'create-event', duration: 4000 }
          )

          // Add a success message to the chat
          const successMessage = {
            id: `success-${Date.now()}`,
            content: `🎉 Great! I've successfully created the event "${createdEvent.summary}" in your calendar.`,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, successMessage])

          // Refresh calendar events if showing
          if (showCalendar) {
            handleQuickAction('today')
          }

        } catch (eventError) {
          console.error('Error creating event:', eventError)
          toast.error(
            `Failed to create event: ${eventError.message}`, 
            { id: 'create-event', duration: 4000 }
          )

          // Add an error message to the chat
          const errorMessage = {
            id: `error-${Date.now()}`,
            content: `❌ Sorry, I couldn't create the event. Error: ${eventError.message}. Please try again with more specific details.`,
            isUser: false,
            timestamp: new Date()
          }
          setMessages(prev => [...prev, errorMessage])
        }
      } else if (data.action === 'create_event') {
        // Fallback for basic event creation detection
        toast.success('Event creation detected! Please provide more details like date, time, and title.')
      }

      setRetryCount(0) // Reset retry count on success

    } catch (error) {
      console.error('Error sending message:', error)
      setError(error.message)
      
      const errorMessage = {
        id: `error-${Date.now()}`,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
      
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (action) => {
    if (loading) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/calendar?type=${action}`)
      const data = await response.json()
      
      if (response.ok) {
        setCalendarEvents(data.events)
        setShowCalendar(true)
        toast.success(`Loaded ${data.events.length} ${action} event${data.events.length !== 1 ? 's' : ''}`)
      } else {
        throw new Error(data.error || 'Failed to fetch calendar data')
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      setError(error.message)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setError(null)
    // You could implement specific retry logic here
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Calendar Assistant...</p>
        </motion.div>
      </div>
    )
  }

  // Sign-in prompt for unauthenticated users
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg"
            >
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6"
            >
              Calendar Assistant
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Chat with your calendar using natural language. Create events, check your schedule, and manage meetings effortlessly.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="mb-8"
            >
              <SignInButton />
            </motion.div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* WhatsApp-style Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">Calendar Assistant</h1>
            <p className="text-green-100 text-sm">
              {loading ? 'AI is typing...' : 'Online • Smart scheduling enabled'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:bg-white/10 p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <SignInButton />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center py-8 sm:py-16"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Welcome back, {session.user?.name?.split(' ')[0] || 'there'}! 👋
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  I can help you schedule meetings, check availability, and manage your calendar with AI!
                </p>
                
                {/* Quick suggestion bubbles */}
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                      onClick={() => handleSendMessage(suggestion)}
                      className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full text-sm shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-2 max-w-4xl mx-auto">
                <AnimatePresence>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageBubble
                        message={message.content}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                      />
                      {/* Render availability results if present */}
                      {message.availabilityResult && renderAvailabilityResults(message.availabilityResult)}
                    </div>
                  ))}
                </AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200 max-w-xs">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <ChatInput
              onSendMessage={handleSendMessage}
              loading={loading}
              suggestions={[]}
            />
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col"
            >
              {/* Sidebar Header */}
              <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold">Calendar</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:bg-white/10 p-1"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="p-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleQuickAction('today')}
                    loading={loading}
                    className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    variant="outline"
                  >
                    <Clock className="w-4 h-4 mr-3" />
                    Today's Events
                  </Button>
                  <Button
                    onClick={() => handleQuickAction('week')}
                    loading={loading}
                    className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    variant="outline"
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    This Week
                  </Button>
                </div>
              </div>

              {/* Calendar Events */}
              <div className="flex-1 overflow-y-auto">
                {showCalendar && calendarEvents.length > 0 ? (
                  <CalendarView
                    events={calendarEvents}
                    title="Recent Events"
                  />
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No events to display</p>
                    <p className="text-sm">Use quick actions to load events</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 