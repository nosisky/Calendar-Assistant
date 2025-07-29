'use client'

import { motion } from 'framer-motion'
import { Calendar, Clock, MapPin, Users, ExternalLink, CalendarDays } from 'lucide-react'
import { formatDateTime, formatTime } from '@/lib/utils'
import Card from '@/components/ui/Card'

const CalendarView = ({ events, title = 'Calendar Events' }) => {
  if (!events || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="text-center py-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500 text-sm">You don't have any events scheduled for this time period.</p>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">
                  {events.length} event{events.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </Card.Header>
        
        <Card.Content className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group border border-gray-200/50 rounded-xl p-4 hover:shadow-md hover:border-primary-200 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                    {event.summary}
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">
                        {formatDateTime(new Date(event.start.dateTime || event.start.date))}
                      </span>
                    </div>
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                </div>
                
                {event.htmlLink && (
                  <a
                    href={event.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0"
                    title="Open in Google Calendar"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </Card.Content>
        
        {events.length > 5 && (
          <Card.Footer className="text-center bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing recent events • <span className="text-primary-600 font-medium">{events.length} total</span>
            </p>
          </Card.Footer>
        )}
      </Card>
    </motion.div>
  )
}

export default CalendarView 