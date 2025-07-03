import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('aiesec_user')
    
    if (!userCookie) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    
    // Transformer les données pour le frontend
    const formattedUser = {
      id: user.id,
      name: user.full_name || `${user.first_name} ${user.last_name}`,
      email: user.email,
      image: user.profile_photo,
      phone: user.contact_detail?.phone,
      entityName: user.home_lc?.name || 'AIESEC Member',
      entityId: user.home_lc?.id,
      // Prendre le premier poste actuel comme rôle principal
      role: user.current_positions?.[0]?.role?.name || 'Member',
      department: user.current_positions?.[0]?.committee_department?.name,
      positionStartDate: user.current_positions?.[0]?.start_date,
      positionEndDate: user.current_positions?.[0]?.end_date,
      // Garder toutes les positions pour usage futur
      allPositions: user.current_positions || [],
    }

    return NextResponse.json({ user: formattedUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}