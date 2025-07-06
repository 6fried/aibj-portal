// src/app/api/performance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AiesecAnalyticsService } from '@/lib/analytics/aiesec-analytics'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('aiesec_access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const year = searchParams.get('year')

    if (!entityId) {
      return NextResponse.json({ error: 'EntityId requis' }, { status: 400 })
    }

    // Mapping des entités string vers office ID numériques
    // IMPORTANT: Remplace ces ID par les vrais office ID de tes LC au Bénin
    const entityMapping: Record<string, number> = {
      'aiesec_benin': 175, // ID de AIESEC in Benin (exemple de ton URL)
      'lc_cotonou': 175,  // Remplace par le vrai ID de LC Cotonou 
      'lc_parakou': 175,  // Remplace par le vrai ID de LC Parakou
      'lc_abomey_calavi': 175, // Remplace par le vrai ID de LC Abomey-Calavi
      // Ajoute d'autres selon tes LC
    }

    const officeId = entityMapping[entityId]
    if (!officeId) {
      return NextResponse.json({ error: 'Entité non trouvée' }, { status: 404 })
    }

    console.log(`Fetching analytics for office ID: ${officeId}, year: ${year || 'current'}`)

    const analyticsService = new AiesecAnalyticsService(accessToken)
    const data = await analyticsService.getPerformanceData(
      officeId, 
      year ? parseInt(year) : undefined
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur lors de la récupération des données de performance:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur interne', 
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 
      { status: 500 }
    )
  }
}