interface TokenResponse {
    access_token: string
    refresh_token: string
    expires_in: number
    token_type: string
  }
  
  interface AiesecUser {
    id: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    profile_photo: string
    contact_detail: {
      phone: string
    }
    home_lc: {
      id: string
      name: string
    }
    current_positions: Array<{
      committee_department: {
        name: string
      }
      start_date: string
      end_date: string
      role: {
        name: string
      }
    }>
  }
  
  export class AiesecAuth {
    private clientId: string
    private clientSecret: string
    private redirectUri: string
  
    constructor() {
      this.clientId = process.env.AIESEC_CLIENT_ID!
      this.clientSecret = process.env.AIESEC_CLIENT_SECRET!
      this.redirectUri = process.env.AIESEC_REDIRECT_URI!
    }
  
    // Étape 1 : Rediriger vers la page d'autorisation AIESEC
    getAuthorizationUrl(): string {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
      })
  
      return `https://auth.aiesec.org/oauth/authorize?${params.toString()}`
    }
  
    // Étape 2 : Échanger le code contre un access token
    async getAccessToken(code: string): Promise<TokenResponse> {
      const response = await fetch('https://auth.aiesec.org/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectUri,
          code,
        }),
      })
  
      if (!response.ok) {
        throw new Error('Failed to get access token')
      }
  
      return response.json()
    }
  
    // Étape 3 : Récupérer les infos utilisateur via GraphQL
    async getCurrentUser(accessToken: string): Promise<AiesecUser> {
      const query = `
        query {
          currentPerson {
            id
            email
            first_name
            last_name
            full_name
            profile_photo
            contact_detail {
              phone
            }
            home_lc {
              id
              name
            }
            current_positions {
              committee_department {
                name
              }
              start_date
              end_date
              role {
                name
              }
            }
          }
        }
      `
  
      const response = await fetch('https://gis-api.aiesec.org/graphql', {
        method: 'POST',
        headers: {
          'Authorization': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })
  
      if (!response.ok) {
        throw new Error('Failed to get user info')
      }
  
      const result = await response.json()
      
      if (result.errors) {
        throw new Error(`GraphQL error: ${result.errors[0].message}`)
      }
  
      return result.data.currentPerson
    }
  
    // Rafraîchir le token
    async refreshToken(refreshToken: string): Promise<TokenResponse> {
      const response = await fetch('https://auth.aiesec.org/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
        }),
      })
  
      if (!response.ok) {
        throw new Error('Failed to refresh token')
      }
  
      return response.json()
    }
  }