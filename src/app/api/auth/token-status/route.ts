import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('aiesec_access_token')
    const expiresAtCookie = cookieStore.get('aiesec_token_expires_at')
    const user = cookieStore.get('aiesec_user')

    if (!accessToken || !user || !expiresAtCookie) {
      return NextResponse.json({ 
        expiringSoon: true,
        expired: true 
      })
    }

    const expiresAt = parseInt(expiresAtCookie.value)
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000 // 5 minutes en ms

    const expired = now >= expiresAt
    const expiringSoon = (expiresAt - now) <= fiveMinutes

    const timeLeftMinutes = Math.max(0, Math.floor((expiresAt - now) / 1000 / 60))

    return NextResponse.json({
      expiringSoon,
      expired,
      expiresAt,
      timeLeftMinutes,
      timeLeftSeconds: Math.max(0, Math.floor((expiresAt - now) / 1000))
    })
  } catch (error) {
    console.error('Token status check error:', error)
    return NextResponse.json({ 
      expiringSoon: true,
      expired: true 
    })
  }
}