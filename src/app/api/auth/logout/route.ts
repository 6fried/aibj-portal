import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    
    // Supprimer tous les cookies d'authentification
    cookieStore.delete('aiesec_access_token')
    cookieStore.delete('aiesec_refresh_token')
    cookieStore.delete('aiesec_token_expires_at')
    cookieStore.delete('aiesec_user')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}