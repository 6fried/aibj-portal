import { Suspense } from 'react'
import AuthErrorContent from './auth-error-content'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<AuthErrorFallback />}>
      <AuthErrorContent />
    </Suspense>
  )
}

function AuthErrorFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p className="text-muted-foreground">Loading error details...</p>
    </div>
  )
}