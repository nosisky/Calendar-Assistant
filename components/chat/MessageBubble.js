'use client'

import { motion } from 'framer-motion'
import { User, Bot, Check, CheckCheck } from 'lucide-react'
import { formatTime } from '@/lib/utils'

export default function MessageBubble({ message, isUser, timestamp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 mb-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-300 text-gray-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </motion.div>

      {/* Message Bubble */}
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.25 }}
          className={`px-4 py-2 rounded-2xl shadow-sm relative ${
            isUser
              ? 'bg-green-500 text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
          }`}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed">
            {message.split('\n').map((line, index) => (
              <div key={index}>
                {line}
                {index < message.split('\n').length - 1 && <br />}
              </div>
            ))}
          </div>

          {/* Timestamp and status */}
          <div className={`flex items-center justify-end gap-1 mt-1 ${
            isUser ? 'text-green-100' : 'text-gray-500'
          }`}>
            <span className="text-xs">
              {formatTime(timestamp)}
            </span>
            {isUser && (
              <CheckCheck className="w-3 h-3 text-green-200" />
            )}
          </div>

          {/* Tail for WhatsApp-style bubble */}
          <div
            className={`absolute bottom-0 w-0 h-0 ${
              isUser
                ? 'right-0 border-l-[10px] border-l-green-500 border-b-[10px] border-b-transparent'
                : 'left-0 border-r-[10px] border-r-white border-b-[10px] border-b-transparent'
            }`}
            style={{
              transform: isUser ? 'translateX(50%)' : 'translateX(-50%)',
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
} 