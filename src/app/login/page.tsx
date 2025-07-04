import { Suspense } from 'react'
import LoginContent from './login-content'

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContent />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-aiesec-blue to-aiesec-teal flex items-center justify-center p-4">
      <div className="text-white text-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    </div>
  )
}