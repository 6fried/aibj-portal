import { useState, useEffect } from 'react'
import { TokenManager } from '@/lib/token-manager'

interface User {
  id: string
  name: string
  email: string
  image?: string
  phone?: string
  entityName: string
  entityId: string
  role: string
  department?: string
  positionStartDate?: string
  positionEndDate?: string
  allPositions: Array<{
    committee_department: { name: string }
    start_date: string
    end_date: string
    role: { name: string }
  }>
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        
        if (data.user) {
          setUser(data.user)
          
          // Démarrer l'auto-refresh des tokens
          const tokenManager = TokenManager.getInstance()
          tokenManager.startAutoRefresh()
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      window.location.href = '/login'
    }
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}