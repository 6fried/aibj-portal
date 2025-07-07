'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AiesecLogo } from '@/components/ui/aiesec-logo'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginContent() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const authUrl = `https://auth.aiesec.org/oauth/authorize?${new URLSearchParams({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_AIESEC_CLIENT_ID!,
        redirect_uri: process.env.NEXT_PUBLIC_AIESEC_REDIRECT_URI!,
      }).toString()}`
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'no_code': return 'No authorization code received. Please try again.'
      case 'auth_failed': return 'Authentication failed. Please check your AIESEC credentials.'
      case 'access_denied': return 'Access denied. You need to authorize the application.'
      case 'session_expired': return 'Your session has expired. Please sign in again.'
      default: return 'An unexpected error occurred. Please try again.'
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <AiesecLogo size="lg" className="mx-auto" />
            <h1 className="text-3xl font-bold mt-4">AIESEC in Benin Portal</h1>
            <p className="text-balance text-muted-foreground">
              Sign in with your official AIESEC account to continue
            </p>
          </div>
          <div className="grid gap-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleLogin} disabled={isLoading} type="submit" className="w-full" size="lg">
              {isLoading ? 'Redirecting...' : 'Sign in with AIESEC'}
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Use your EXPA credentials to sign in.
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {/* Vous pouvez remplacer le style par une balise Image de Next.js */}
        <div 
          className="h-full w-full object-cover dark:brightness-[0.8]"
          style={{
            backgroundImage: 'url(https://aiesec.org/wp-content/uploads/2022/10/AIESEC-Volunteers-in-a-project-in-Brazil-1024x683.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
    </div>
  )
}