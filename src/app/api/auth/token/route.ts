import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('aiesec_access_token')

  if (tokenCookie) {
    return NextResponse.json({ access_token: tokenCookie.value })
  }

  return NextResponse.json({ error: 'Access token not found' }, { status: 401 })
}
