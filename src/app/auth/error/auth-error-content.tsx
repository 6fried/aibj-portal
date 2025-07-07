'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[380px] gap-6 text-center">
          <div className="grid gap-4">
            <div className="text-5xl">{error.icon}</div>
            <h1 className="text-3xl font-bold">{error.title}</h1>
            <p className="text-balance text-muted-foreground">
              {error.description}
            </p>
          </div>
          {errorDetail && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm text-left">
                <strong>Details:</strong> {errorDetail}
              </AlertDescription>
            </Alert>
          )}
          <Button asChild className="w-full" size="lg">
            <Link href="/login">{error.action}</Link>
          </Button>
          <div className="mt-4 text-center text-sm">
            If the problem persists, please contact support.
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div
          className="h-full w-full object-cover dark:brightness-[0.8]"
          style={{
            backgroundImage:
              'url(https://aiesec.org/wp-content/uploads/2022/10/AIESEC-Volunteers-in-a-project-in-Brazil-1024x683.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>
    </div>
  )
}