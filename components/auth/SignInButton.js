'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { User, LogOut, Loader2 } from 'lucide-react'

const SignInButton = () => {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <Button variant="ghost" size="sm" disabled className="min-w-[100px]">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center ring-2 ring-white shadow-sm">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'User'} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-primary-600" />
            )}
          </div>
          <span className="hidden lg:block font-medium max-w-[120px] truncate">
            {session.user?.name || 'User'}
          </span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => signOut()}
          className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <Button 
      onClick={() => signIn('google')}
      size="sm"
      className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm transition-all duration-200 min-w-[120px] sm:min-w-[160px]"
    >
      <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span className="hidden sm:inline">Sign in with Google</span>
      <span className="sm:hidden">Sign in</span>
    </Button>
  )
}

export default SignInButton 