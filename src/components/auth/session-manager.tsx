'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function SessionManager() {
  const { isAuthenticated, logout } = useAuth()
  const [showSessionWarning, setShowSessionWarning] = useState(false)
  const [countdown, setCountdown] = useState(60) // 60 secondes avant déconnexion

  useEffect(() => {
    if (!isAuthenticated) return

    // Écouter les événements de session expirée
    const handleSessionExpired = () => {
      setShowSessionWarning(true)
      
      // Décompte avant déconnexion automatique
      let timeLeft = 60
      const countdownInterval = setInterval(() => {
        timeLeft -= 1
        setCountdown(timeLeft)
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval)
          logout()
        }
      }, 1000)

      return () => clearInterval(countdownInterval)
    }

    // Écouter les erreurs d'authentification globales
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail.type === 'session_expired') {
        handleSessionExpired()
      }
    }

    window.addEventListener('auth-error', handleAuthError as EventListener)
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError as EventListener)
    }
  }, [isAuthenticated, logout])

  const extendSession = async () => {
    try {
      const response = await fetch('/api/auth/refresh', { method: 'POST' })
      if (response.ok) {
        setShowSessionWarning(false)
        setCountdown(60)
        window.location.reload() // Actualiser pour récupérer les nouveaux tokens
      } else {
        logout()
      }
    } catch (error) {
      console.error('Session extension failed:', error)
      logout()
    }
  }

  if (!showSessionWarning) return null

  return (
    <Dialog open={showSessionWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-aiesec-orange">Session Expiring</DialogTitle>
          <DialogDescription>
            Your session will expire in {countdown} seconds due to inactivity.
            Do you want to extend your session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={logout}
            className="flex-1"
          >
            Logout Now
          </Button>
          <Button 
            onClick={extendSession}
            className="flex-1 bg-aiesec-blue hover:bg-aiesec-blue/90"
          >
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}