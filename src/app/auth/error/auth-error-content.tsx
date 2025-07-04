'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AiesecLogo } from '@/components/ui/aiesec-logo'
import Link from 'next/link'

const errorMessages = {
  session_expired: {
    title: 'Session Expired',
    description: 'Your session has expired due to inactivity. Please sign in again.',
    action: 'Sign In Again',
    icon: '⏰'
  },
  access_denied: {
    title: 'Access Denied',
    description: 'You denied access to the application. To use the portal, you need to authorize access to your AIESEC account.',
    action: 'Try Again',
    icon: '🚫'
  },
  invalid_request: {
    title: 'Invalid Request',
    description: 'The authentication request was invalid. This might be a technical issue.',
    action: 'Start Over',
    icon: '❌'
  },
  server_error: {
    title: 'Server Error',
    description: 'The AIESEC authentication server encountered an error. Please try again in a few minutes.',
    action: 'Retry',
    icon: '🔧'
  },
  network_error: {
    title: 'Network Error',
    description: 'Unable to connect to AIESEC servers. Check your internet connection.',
    action: 'Retry',
    icon: '🌐'
  },
  token_error: {
    title: 'Token Error',
    description: 'There was an issue with your authentication token. Please sign in again.',
    action: 'Sign In',
    icon: '🔑'
  },
  default: {
    title: 'Authentication Error',
    description: 'An unexpected error occurred during authentication. Please try again.',
    action: 'Try Again',
    icon: '⚠️'
  }
}

export default function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorType = searchParams.get('error') || 'default'
  const errorDetail = searchParams.get('detail')
  
  const error = errorMessages[errorType as keyof typeof errorMessages] || errorMessages.default

  return (
    <div className="min-h-screen bg-gradient-to-br from-aiesec-blue to-aiesec-teal flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AiesecLogo size="xl" />
          </div>
          <div className="text-4xl mb-2">{error.icon}</div>
          <CardTitle className="text-2xl font-bold text-aiesec-dark">
            {error.title}
          </CardTitle>
          <CardDescription>
            {error.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorDetail && (
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Details:</strong> {errorDetail}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            <Button
              asChild
              className="flex-1 bg-aiesec-blue hover:bg-aiesec-blue/90"
            >
              <Link href="/login">
                {error.action}
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="flex-1"
            >
              <Link href="/">
                Home
              </Link>
            </Button>
          </div>
          
          <div className="text-center text-sm text-aiesec-dark/60">
            Need help? Contact AIESEC in Benin support
          </div>
        </CardContent>
      </Card>
    </div>
  )
}