export interface PerformanceData {
    // Opens
    open_ogx: number
    open_o_programme_7: number // oGV - Global Volunteer
    open_o_programme_8: number // oGTa - Global Talent
    open_o_programme_9: number // oGTe - Global Teacher
    open_icx: number
    open_i_programme_7: number // iGV - Global Volunteer
    open_i_programme_8: number // iGTa - Global Talent
    open_i_programme_9: number // iGTe - Global Teacher
    
    // OGX Funnel stages
    o_applied_7: number    // oGV Applied
    o_applied_8: number    // oGTa Applied
    o_applied_9: number    // oGTe Applied
    o_matched_7: number    // oGV Accepted by Host
    o_matched_8: number    // oGTa Accepted by Host
    o_matched_9: number    // oGTe Accepted by Host
    o_an_accepted_7: number // oGV Accepted
    o_an_accepted_8: number // oGTa Accepted
    o_an_accepted_9: number // oGTe Accepted
    o_approved_7: number   // oGV Approved
    o_approved_8: number   // oGTa Approved
    o_approved_9: number   // oGTe Approved
    o_realized_7: number   // oGV Realized
    o_realized_8: number   // oGTa Realized
    o_realized_9: number   // oGTe Realized
    o_finished_7: number   // oGV Finished
    o_finished_8: number   // oGTa Finished
    o_finished_9: number   // oGTe Finished
    o_completed_7: number  // oGV Completed
    o_completed_8: number  // oGTa Completed
    o_completed_9: number  // oGTe Completed
    
    // ICX Funnel stages
    i_applied_7: number    // iGV Applied
    i_applied_8: number    // iGTa Applied
    i_applied_9: number    // iGTe Applied
    i_matched_7: number    // iGV Matched
    i_matched_8: number    // iGTa Matched
    i_matched_9: number    // iGTe Matched
    i_an_accepted_7: number // iGV Accepted
    i_an_accepted_8: number // iGTa Accepted
    i_an_accepted_9: number // iGTe Accepted
    i_approved_7: number   // iGV Approved
    i_approved_8: number   // iGTa Approved
    i_approved_9: number   // iGTe Approved
    i_realized_7: number   // iGV Realized
    i_realized_8: number   // iGTa Realized
    i_realized_9: number   // iGTe Realized
    i_finished_7: number   // iGV Finished
    i_finished_8: number   // iGTa Finished
    i_finished_9: number   // iGTe Finished
    i_completed_7: number  // iGV Completed
    i_completed_8: number  // iGTa Completed
    i_completed_9: number  // iGTe Completed
  }
  
  export interface ProcessedPerformanceData {
    ogx: {
      total: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
      gv: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
      gta: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
      gte: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
    }
    icx: {
      total: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
      gv: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
      gta: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
      gte: {
        SU: number
        APL: number
        ACH: number
        ACC: number
        APD: number
        RE: number
        FIN: number
        CO: number
      }
    }
  }
  
  export class AiesecAnalyticsService {
    private accessToken: string
  
    constructor(accessToken: string) {
      this.accessToken = accessToken
    }
  
    async getPerformanceData(
      officeId: number,
      year: number = new Date().getFullYear()
    ): Promise<ProcessedPerformanceData> {
      // Calculer les dates de début et fin selon l'année AIESEC (Février à Janvier)
      const startDate = `${year}-02-01`
      const endDate = `${year + 1}-01-31`
      
      try {
        // Construire l'URL avec les paramètres selon le format correct
        const url = new URL('https://analytics.api.aiesec.org/v2/applications/analyze.json')
        url.searchParams.append('access_token', this.accessToken)
        url.searchParams.append('start_date', startDate)
        url.searchParams.append('end_date', endDate)
        url.searchParams.append('performance_v3[office_id]', officeId.toString())
  
        console.log('Fetching analytics data from:', url.toString())
  
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
  
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Analytics API Error:', response.status, errorText)
          throw new Error(`Failed to fetch analytics data: ${response.status} ${response.statusText}`)
        }
  
        const rawData = await response.json()
        console.log('Raw analytics data:', JSON.stringify(rawData, null, 2))
        
        return this.processPerformanceData(rawData)
      } catch (error) {
        console.error('Error fetching performance data:', error)
        throw error
      }
    }
  
    private processPerformanceData(rawData: any): ProcessedPerformanceData {
      // Parser les données selon la structure de réponse AIESEC
      // Fonction helper pour extraire la valeur
      const getValue = (obj: any, fallback: number = 0): number => {
        if (!obj) return fallback
        if (typeof obj === 'number') return obj
        if (obj.doc_count !== undefined) return obj.doc_count
        if (obj.applicants?.value !== undefined) return obj.applicants.value
        if (obj.value !== undefined) return obj.value
        return fallback
      }
  
      const data: ProcessedPerformanceData = {
        ogx: {
          total: {
            SU: getValue(rawData.open_ogx),
            APL: getValue(rawData.o_applied_7) + getValue(rawData.o_applied_8) + getValue(rawData.o_applied_9),
            ACH: getValue(rawData.o_matched_7) + getValue(rawData.o_matched_8) + getValue(rawData.o_matched_9),
            ACC: getValue(rawData.o_an_accepted_7) + getValue(rawData.o_an_accepted_8) + getValue(rawData.o_an_accepted_9),
            APD: getValue(rawData.o_approved_7) + getValue(rawData.o_approved_8) + getValue(rawData.o_approved_9),
            RE: getValue(rawData.o_realized_7) + getValue(rawData.o_realized_8) + getValue(rawData.o_realized_9),
            FIN: getValue(rawData.o_finished_7) + getValue(rawData.o_finished_8) + getValue(rawData.o_finished_9),
            CO: getValue(rawData.o_completed_7) + getValue(rawData.o_completed_8) + getValue(rawData.o_completed_9),
          },
          gv: {
            SU: getValue(rawData.open_o_programme_7),
            APL: getValue(rawData.o_applied_7),
            ACH: getValue(rawData.o_matched_7),
            ACC: getValue(rawData.o_an_accepted_7),
            APD: getValue(rawData.o_approved_7),
            RE: getValue(rawData.o_realized_7),
            FIN: getValue(rawData.o_finished_7),
            CO: getValue(rawData.o_completed_7),
          },
          gta: {
            SU: getValue(rawData.open_o_programme_8),
            APL: getValue(rawData.o_applied_8),
            ACH: getValue(rawData.o_matched_8),
            ACC: getValue(rawData.o_an_accepted_8),
            APD: getValue(rawData.o_approved_8),
            RE: getValue(rawData.o_realized_8),
            FIN: getValue(rawData.o_finished_8),
            CO: getValue(rawData.o_completed_8),
          },
          gte: {
            SU: getValue(rawData.open_o_programme_9),
            APL: getValue(rawData.o_applied_9),
            ACH: getValue(rawData.o_matched_9),
            ACC: getValue(rawData.o_an_accepted_9),
            APD: getValue(rawData.o_approved_9),
            RE: getValue(rawData.o_realized_9),
            FIN: getValue(rawData.o_finished_9),
            CO: getValue(rawData.o_completed_9),
          },
        },
        icx: {
          total: {
            SU: getValue(rawData.open_icx),
            APL: getValue(rawData.i_applied_7) + getValue(rawData.i_applied_8) + getValue(rawData.i_applied_9),
            ACH: getValue(rawData.i_matched_7) + getValue(rawData.i_matched_8) + getValue(rawData.i_matched_9),
            ACC: getValue(rawData.i_an_accepted_7) + getValue(rawData.i_an_accepted_8) + getValue(rawData.i_an_accepted_9),
            APD: getValue(rawData.i_approved_7) + getValue(rawData.i_approved_8) + getValue(rawData.i_approved_9),
            RE: getValue(rawData.i_realized_7) + getValue(rawData.i_realized_8) + getValue(rawData.i_realized_9),
            FIN: getValue(rawData.i_finished_7) + getValue(rawData.i_finished_8) + getValue(rawData.i_finished_9),
            CO: getValue(rawData.i_completed_7) + getValue(rawData.i_completed_8) + getValue(rawData.i_completed_9),
          },
          gv: {
            SU: getValue(rawData.open_i_programme_7),
            APL: getValue(rawData.i_applied_7),
            ACH: getValue(rawData.i_matched_7),
            ACC: getValue(rawData.i_an_accepted_7),
            APD: getValue(rawData.i_approved_7),
            RE: getValue(rawData.i_realized_7),
            FIN: getValue(rawData.i_finished_7),
            CO: getValue(rawData.i_completed_7),
          },
          gta: {
            SU: getValue(rawData.open_i_programme_8),
            APL: getValue(rawData.i_applied_8),
            ACH: getValue(rawData.i_matched_8),
            ACC: getValue(rawData.i_an_accepted_8),
            APD: getValue(rawData.i_approved_8),
            RE: getValue(rawData.i_realized_8),
            FIN: getValue(rawData.i_finished_8),
            CO: getValue(rawData.i_completed_8),
          },
          gte: {
            SU: getValue(rawData.open_i_programme_9),
            APL: getValue(rawData.i_applied_9),
            ACH: getValue(rawData.i_matched_9),
            ACC: getValue(rawData.i_an_accepted_9),
            APD: getValue(rawData.i_approved_9),
            RE: getValue(rawData.i_realized_9),
            FIN: getValue(rawData.i_finished_9),
            CO: getValue(rawData.i_completed_9),
          },
        },
      }
  
      return data
    }
  }