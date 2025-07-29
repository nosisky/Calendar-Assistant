# 📅 Calendar Assistant - WhatsApp-Style Chat Interface

A modern, WhatsApp-inspired calendar management application that lets you interact with your Google Calendar using natural language. Built with Next.js, powered by AWS Bedrock (Claude AI), and featuring a sleek chat interface.

## ✨ Features

### 🎨 WhatsApp-Style Interface
- **Modern Chat UI**: Clean, messaging-app-inspired design
- **Auto-scrolling Messages**: Automatic scroll to latest messages
- **Real-time Typing Indicators**: Shows when AI is processing
- **Message Bubbles**: Distinct styling for user and assistant messages
- **Sidebar Navigation**: Collapsible sidebar with quick actions

### 🤖 AI-Powered Calendar Management
- **Natural Language Processing**: Ask in plain English
- **Conversation Memory**: Remembers context from previous messages
- **Smart Event Creation**: Automatically extracts event details
- **Context-Aware Responses**: References previous conversations

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large touch targets and smooth animations
- **Cross-Platform**: Works seamlessly on desktop and mobile

### 🔐 Secure Authentication
- **Google OAuth2**: Secure login with Google
- **Privacy-First**: Your data stays private
- **Session Management**: Automatic token refresh

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Cloud Console project
- AWS account with Bedrock access

### 1. Clone & Install
```bash
git clone <your-repo>
cd calendar-assistant
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AWS Bedrock
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

### 3. Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth2 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Add your email as a test user in OAuth consent screen

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to start chatting with your calendar!

## 💬 Example Conversations

### Creating Events
**You**: "Schedule a team meeting tomorrow at 2pm"  
**AI**: *Creates event and confirms* ✅ Event "Team Meeting" created successfully!

**You**: "Book a call with sarah@company.com on Friday at 10am"  
**AI**: *Extracts email, creates meeting with attendee*

### Viewing Schedule
**You**: "What meetings do I have today?"  
**AI**: *Shows today's events in a clean list*

**You**: "How busy am I this week?"  
**AI**: *Provides weekly overview with insights*

### Follow-up Questions
**You**: "What about next week?"  
**AI**: *Remembers context from previous question about schedule*

**You**: "Can you reschedule that meeting to 3pm?"  
**AI**: *Knows which meeting you're referring to*

## 🏗️ Architecture

### Frontend (Next.js 14)
- **App Router**: Modern Next.js routing
- **React 18**: Latest React features
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **NextAuth.js**: Authentication

### Backend APIs
- **Chat API**: Processes messages with conversation history
- **Calendar API**: Handles Google Calendar operations
- **Authentication**: Manages OAuth2 tokens

### AI Integration
- **AWS Bedrock**: Claude 3 Sonnet model
- **Context Awareness**: Maintains conversation history
- **Smart Parsing**: Extracts structured data from natural language

### External Services
- **Google Calendar API**: Calendar operations
- **Google OAuth2**: User authentication
- **AWS Bedrock**: AI model inference

## 🎯 Key Components

### Chat Interface
- `MessageBubble`: WhatsApp-style message bubbles
- `ChatInput`: Modern input with emoji and attachment buttons
- `Auto-scroll`: Smooth scrolling to latest messages

### Calendar Integration
- `CalendarView`: Clean event display
- `Event Creation`: Smart form processing
- `Quick Actions`: One-click calendar operations

### Authentication
- `SignInButton`: Google OAuth integration
- `Session Management`: Automatic token handling
- `Protected Routes`: Secure API endpoints

## 🔧 Customization

### Styling
The app uses a green color scheme inspired by WhatsApp. To customize:

1. Update `tailwind.config.js` for theme colors
2. Modify `app/globals.css` for component styles
3. Adjust color classes in components

### AI Behavior
Customize AI responses in `lib/aws-bedrock.js`:
- Modify system prompts
- Adjust conversation history length
- Change response formatting

### Features
Add new features by:
1. Creating new API routes in `app/api/`
2. Adding components in `components/`
3. Updating the main chat logic in `app/page.js`

## 🐛 Troubleshooting

### Common Issues

**"Access blocked: Test Me has not completed the Google verification process"**
- Add your Google account as a test user in OAuth consent screen

**"Error 400: redirect_uri_mismatch"**
- Ensure `NEXTAUTH_URL` matches your domain
- Add correct redirect URI in Google Cloud Console

**Calendar events not creating**
- Check Google Calendar API is enabled
- Verify OAuth scopes include calendar permissions
- Check AWS Bedrock credentials and region

**Messages not showing conversation history**
- Ensure conversation history is being passed to API
- Check browser console for JavaScript errors

### Development Tips
- Use browser dev tools to inspect API calls
- Check server logs for detailed error messages
- Test with different natural language inputs
- Verify environment variables are loaded

## 📦 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Update `NEXTAUTH_URL` to your production domain
4. Deploy!

### Other Platforms
- Update `NEXTAUTH_URL` to match your domain
- Ensure all environment variables are set
- Configure OAuth redirect URIs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **AWS Bedrock** - Powerful AI capabilities
- **Google Calendar API** - Calendar integration

---

**Built with ❤️ using modern web technologies**

For support or questions, please open an issue on GitHub. 