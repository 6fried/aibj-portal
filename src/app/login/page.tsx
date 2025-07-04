'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AiesecLogo } from '@/components/ui/aiesec-logo'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      // Construction de l'URL d'autorisation AIESEC
      const authUrl = `https://auth.aiesec.org/oauth/authorize?${new URLSearchParams({
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_AIESEC_CLIENT_ID!,
        redirect_uri: process.env.NEXT_PUBLIC_AIESEC_REDIRECT_URI!,
      }).toString()}`
      
      console.log('🔗 Redirecting to AIESEC auth:', authUrl)
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
    }
  }

  // Messages d'erreur localisés
  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'no_code':
        return 'No authorization code received. Please try again.'
      case 'auth_failed':
        return 'Authentication failed. Please check your AIESEC credentials.'
      case 'access_denied':
        return 'Access denied. You need to authorize the application.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aiesec-blue to-aiesec-teal flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AiesecLogo size="xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-aiesec-dark">
            Welcome to AIESEC in Benin Portal
          </CardTitle>
          <CardDescription>
            Sign in with your AIESEC account to access the portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {getErrorMessage(error)}
              </AlertDescription>
            </Alert>
          )}
          
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-aiesec-blue hover:bg-aiesec-blue/90"
            size="lg"
          >
            {isLoading ? 'Redirecting to AIESEC...' : 'Sign in with AIESEC'}
          </Button>
          
          <div className="text-center text-sm text-aiesec-dark/60">
            Use your AIESEC credentials (same as EXPA)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}