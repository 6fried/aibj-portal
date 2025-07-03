import { AiesecAuth } from '@/lib/aiesec-auth'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('🔄 Auth callback received')
  console.log('🔗 Full URL:', request.url)
  
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  console.log('📝 Code:', code ? 'Present' : 'Missing')
  console.log('❌ Error:', error)

  if (error) {
    console.error('🚨 OAuth error:', error)
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url))
  }

  if (!code) {
    console.error('🚨 No code received')
    return NextResponse.redirect(new URL('/auth/error?error=invalid_request&detail=No authorization code received', request.url))
  }

  try {
    console.log('🔐 Starting token exchange...')
    const auth = new AiesecAuth()
    
    // Échanger le code contre des tokens
    const tokens = await auth.getAccessToken(code)
    console.log('✅ Tokens received, expires in:', tokens.expires_in)
    
    // Récupérer les infos utilisateur
    console.log('👤 Fetching user info...')
    const user = await auth.getCurrentUser(tokens.access_token)
    console.log('✅ User info received:', user.full_name, user.email)

    // Calculer l'expiration
    const expiresAt = Date.now() + (tokens.expires_in * 1000)

    // Stocker les données dans des cookies sécurisés
    console.log('🍪 Setting cookies...')
    const cookieStore = await cookies()
    
    cookieStore.set('aiesec_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    })

    cookieStore.set('aiesec_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    })

    cookieStore.set('aiesec_token_expires_at', expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    })

    cookieStore.set('aiesec_user', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in,
    })

    console.log('🎉 Auth success, redirecting to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    console.error('💥 Auth callback error:', error)
    return NextResponse.redirect(new URL('/auth/error?error=token_error&detail=Failed to process authentication', request.url))
  }
}