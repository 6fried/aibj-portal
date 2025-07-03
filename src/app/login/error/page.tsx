import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AiesecLogo } from '@/components/ui/aiesec-logo'
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-aiesec-blue to-aiesec-teal flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AiesecLogo size="xl" />
          </div>
          <CardTitle className="text-2xl font-bold text-aiesec-red">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was an error signing you in. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            asChild
            className="w-full bg-aiesec-blue hover:bg-aiesec-blue/90"
            size="lg"
          >
            <Link href="/login">
              Try Again
            </Link>
          </Button>
          
          <div className="text-center text-sm text-aiesec-dark/60">
            If the problem persists, contact support
          </div>
        </CardContent>
      </Card>
    </div>
  )
}