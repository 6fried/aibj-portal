import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AiesecAuth } from '@/lib/aiesec-auth'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('aiesec_refresh_token')

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' }, 
        { status: 401 }
      )
    }

    console.log('🔄 Attempting token refresh...')
    const auth = new AiesecAuth()
    
    // Utiliser le refresh token pour obtenir de nouveaux tokens
    const newTokens = await auth.refreshToken(refreshToken.value)
    
    // Récupérer les nouvelles informations utilisateur
    const user = await auth.getCurrentUser(newTokens.access_token)

    // Calculer la nouvelle expiration
    const newExpiresAt = Date.now() + (newTokens.expires_in * 1000)

    // Mettre à jour les cookies
    cookieStore.set('aiesec_access_token', newTokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: newTokens.expires_in,
    })

    cookieStore.set('aiesec_refresh_token', newTokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    })

    cookieStore.set('aiesec_token_expires_at', newExpiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: newTokens.expires_in,
    })

    cookieStore.set('aiesec_user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: newTokens.expires_in,
    })

    console.log('✅ Token refresh successful')
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('💥 Token refresh failed:', error)
    
    // Supprimer les cookies expirés
    const cookieStore = await cookies()
    cookieStore.delete('aiesec_access_token')
    cookieStore.delete('aiesec_refresh_token')
    cookieStore.delete('aiesec_token_expires_at')
    cookieStore.delete('aiesec_user')

    return NextResponse.json(
      { error: 'Token refresh failed' }, 
      { status: 401 }
    )
  }
}