import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('aiesec_user')
    
    if (!userCookie) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    
    // Transformer les données pour le frontend
    const entityId = user.home_lc?.id;
    const entityMapping: Record<number, string> = {
      175: 'aiesec_benin',       // AIESEC in Benin
      // IMPORTANT: Remplace ces ID par les vrais office ID de tes LC
      1649: 'lc_cotonou',         // Exemple: LC Cotonou
      2134: 'lc_parakou',         // Exemple: LC Parakou
      2135: 'lc_abomey_calavi', // Exemple: LC Abomey-Calavi
    };
    const entitySlug = entityId ? entityMapping[entityId] || `unknown_entity_${entityId}` : 'unknown';

    const formattedUser = {
      id: user.id,
      name: user.full_name || `${user.first_name} ${user.last_name}`,
      email: user.email,
      image: user.profile_photo,
      phone: user.contact_detail?.phone,
      entityName: user.home_lc?.name || 'AIESEC Member',
      entityId: entityId,
      entitySlug: entitySlug,
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