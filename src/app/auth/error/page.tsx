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
    <div className="min-h-screen bg-gradient-to-br from-aiesec-blue to-aiesec-teal flex items-center justify-center p-4">
      <div className="text-white text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  )
}