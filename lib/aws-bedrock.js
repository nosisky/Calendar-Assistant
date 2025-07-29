import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function invokeClaude(messages, systemPrompt = '') {
  try {
    const input = {
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 4096,
        messages: messages,
        system: systemPrompt,
      }),
    }

    const command = new InvokeModelCommand(input)
    const response = await client.send(command)
    
    const responseBody = JSON.parse(new TextDecoder().decode(response.body))
    return responseBody.content[0].text
  } catch (error) {
    console.error('Error invoking Claude:', error)
    throw new Error('Failed to get response from AI model')
  }
}

export async function processCalendarQuery(userMessage, calendarData, conversationHistory = []) {
  const systemPrompt = `You are a helpful calendar assistant with advanced scheduling capabilities. You can help users with their calendar by:
1. Reading and summarizing calendar events
2. Creating new calendar events
3. Checking availability for multiple people
4. Finding optimal meeting times for groups
5. Modifying existing events
6. Providing calendar insights and suggestions

Current calendar data: ${JSON.stringify(calendarData)}

Respond in a helpful, conversational manner. If the user wants to create or modify an event, provide the necessary details in a structured format. If you need more information, ask clarifying questions.

Always be specific about dates, times, and details when creating events. Use the conversation history to provide contextual responses and remember what the user has asked about previously.

IMPORTANT: When a user wants to create/schedule/add an event, respond with a helpful message AND include a JSON object at the end of your response with the format:
EVENT_DATA: {"summary": "Event Title", "description": "Event Description", "startTime": "2024-01-15T14:00:00", "endTime": "2024-01-15T15:00:00", "attendees": ["email@example.com"], "timeZone": "America/New_York"}

For availability checking or group scheduling, include:
AVAILABILITY_CHECK: {"action": "find_optimal_time", "emails": ["email1@example.com", "email2@example.com"], "duration": 60, "preferences": {"preferredHours": {"start": 9, "end": 17}}}

Use ISO 8601 format for dates and times. If no end time is specified, assume 1 hour duration. If no attendees are mentioned, use an empty array.`

  // Build the conversation messages array
  const messages = []
  
  // Add conversation history
  conversationHistory.forEach(msg => {
    messages.push({
      role: msg.isUser ? 'user' : 'assistant',
      content: msg.content
    })
  })
  
  // Add the current user message
  messages.push({
    role: 'user',
    content: userMessage
  })

  return await invokeClaude(messages, systemPrompt)
} 