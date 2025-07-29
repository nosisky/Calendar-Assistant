'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Smile } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ChatInput({ onSendMessage, loading, suggestions = [] }) {
  const [message, setMessage] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const textareaRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim() && !loading) {
      onSendMessage(message.trim())
      setMessage('')
      setShowSuggestions(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value)
    if (e.target.value.trim()) {
      setShowSuggestions(false)
    } else {
      setShowSuggestions(true)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    onSendMessage(suggestion)
    setShowSuggestions(false)
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  return (
    <div className="w-full">
      {/* Quick suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-3"
        >
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.2 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm transition-all duration-200 border border-gray-200 hover:border-gray-300"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 bg-white rounded-3xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="flex items-end px-4 py-2">
            {/* Attachment button */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Text input */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={loading}
              className="flex-1 resize-none border-none outline-none px-2 py-2 text-gray-900 placeholder-gray-500 bg-transparent max-h-[120px] min-h-[20px]"
              rows={1}
            />

            {/* Emoji button */}
            <button
              type="button"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Send button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            type="submit"
            disabled={!message.trim() || loading}
            className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed p-0 flex items-center justify-center shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-white" />
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  )
} 