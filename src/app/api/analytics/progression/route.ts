import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('aiesec_access_token')

  if (!tokenCookie) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const officeId = searchParams.get('officeId')

  if (!startDate || !endDate || !officeId) {
    return NextResponse.json({ error: 'Missing required query parameters' }, { status: 400 })
  }

  const analyticsUrl = `https://analytics.api.aiesec.org/v2/applications/analyze.json?access_token=${tokenCookie.value}&start_date=${startDate}&end_date=${endDate}&performance_v3[office_id]=${officeId}`

  try {
    const response = await fetch(analyticsUrl, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: 'Failed to fetch analytics data', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error proxying analytics request:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
