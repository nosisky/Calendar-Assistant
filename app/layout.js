import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import ClientSessionProvider from '@/components/providers/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Calendar Chat Assistant',
  description: 'Chat with your calendar using natural language powered by AI',
  keywords: ['calendar', 'AI', 'chat', 'assistant', 'productivity'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <ClientSessionProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #374151',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                backdropFilter: 'blur(8px)',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#0ea5e9',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </ClientSessionProvider>
      </body>
    </html>
  )
} 