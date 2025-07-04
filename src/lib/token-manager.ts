export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<boolean> | null = null

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  // Vérifier si le token expire dans les 5 prochaines minutes
  async isTokenExpiringSoon(): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/token-status')
      const data = await response.json()
      return data.expiringSoon || false
    } catch {
      return true // En cas d'erreur, considérer comme expirant
    }
  }

  // Rafraîchir le token
  async refreshToken(): Promise<boolean> {
    // Éviter les refreshs multiples simultanés
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.performRefresh()
    const result = await this.refreshPromise
    this.refreshPromise = null
    
    return result
  }

  private async performRefresh(): Promise<boolean> {
    try {
      console.log('🔄 Refreshing access token...')
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })

      if (response.ok) {
        console.log('✅ Token refreshed successfully')
        return true
      } else {
        console.error('❌ Token refresh failed:', response.status)
        return false
      }
    } catch (error) {
      console.error('💥 Token refresh error:', error)
      return false
    }
  }

  // Démarrer la surveillance automatique des tokens
  startAutoRefresh() {
    // Vérifier toutes les 30 secondes
    const interval = setInterval(async () => {
      const shouldRefresh = await this.isTokenExpiringSoon()
      
      if (shouldRefresh) {
        const success = await this.refreshToken()
        
        if (!success) {
          console.warn('🚨 Auto-refresh failed, user will be logged out')
          clearInterval(interval)
          window.location.href = '/auth/error?error=session_expired'
        }
      }
    }, 30 * 1000) // 30 secondes

    // Nettoyer à la fermeture de la page
    window.addEventListener('beforeunload', () => {
      clearInterval(interval)
    })

    return interval
  }
}