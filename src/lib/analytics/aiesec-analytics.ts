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
 
  // Ajoute ces interfaces au début du fichier
interface AnalyticsObject {
  doc_count?: number;
  applicants?: {
    value?: number;
  };
  value?: number;
}

interface StatusProgressionData {
  month: string // "2024-01"
  apl: number
  acc: number
  apd: number
  re: number
  fin: number
  co: number
}
  

export class AiesecAnalyticsService {
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
  }
  private _getApiUrl(path: string): string {
    const baseUrl =
      typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        : ''
    return `${baseUrl}${path}`
  }

  private getValue(obj: unknown, fallback: number = 0): number {
    if (!obj) return fallback;
    if (typeof obj === 'number') return obj;
    if (typeof obj === 'object' && obj !== null) {
        const data = obj as AnalyticsObject;
        if (typeof data.doc_count === 'number') return data.doc_count;
        if (typeof data.applicants?.value === 'number') return data.applicants.value;
        if (typeof data.value === 'number') return data.value;
    }
    return fallback;
  }

  async getPerformanceData(
    officeId: number,
    year: number = new Date().getFullYear()
  ): Promise<ProcessedPerformanceData> {
    const startDate = `${year}-02-01`
    const endDate = `${year + 1}-01-31`
    
    try {
      if (!this.accessToken) {
        throw new Error('Access token is required for this operation');
      }
      const url = new URL('https://analytics.api.aiesec.org/v2/applications/analyze.json');
      url.searchParams.append('access_token', this.accessToken);
      url.searchParams.append('start_date', startDate);
      url.searchParams.append('end_date', endDate);
      url.searchParams.append('performance_v3[office_id]', officeId.toString());


      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Analytics API Error:', response.status, errorText)
        throw new Error(`Failed to fetch analytics data: ${response.status} ${response.statusText}`)
      }

      const rawData = await response.json()
      return this.processPerformanceData(rawData)
    } catch (error) {
      console.error('Error fetching performance data:', error)
      throw error
    }
  }

  private processPerformanceData(rawData: PerformanceData): ProcessedPerformanceData {
    const data: ProcessedPerformanceData = {
      ogx: {
        total: {
          SU: this.getValue(rawData.open_ogx),
          APL: this.getValue(rawData.o_applied_7) + this.getValue(rawData.o_applied_8) + this.getValue(rawData.o_applied_9),
          ACH: this.getValue(rawData.o_matched_7) + this.getValue(rawData.o_matched_8) + this.getValue(rawData.o_matched_9),
          ACC: this.getValue(rawData.o_an_accepted_7) + this.getValue(rawData.o_an_accepted_8) + this.getValue(rawData.o_an_accepted_9),
          APD: this.getValue(rawData.o_approved_7) + this.getValue(rawData.o_approved_8) + this.getValue(rawData.o_approved_9),
          RE: this.getValue(rawData.o_realized_7) + this.getValue(rawData.o_realized_8) + this.getValue(rawData.o_realized_9),
          FIN: this.getValue(rawData.o_finished_7) + this.getValue(rawData.o_finished_8) + this.getValue(rawData.o_finished_9),
          CO: this.getValue(rawData.o_completed_7) + this.getValue(rawData.o_completed_8) + this.getValue(rawData.o_completed_9),
        },
        gv: {
          SU: this.getValue(rawData.open_o_programme_7),
          APL: this.getValue(rawData.o_applied_7),
          ACH: this.getValue(rawData.o_matched_7),
          ACC: this.getValue(rawData.o_an_accepted_7),
          APD: this.getValue(rawData.o_approved_7),
          RE: this.getValue(rawData.o_realized_7),
          FIN: this.getValue(rawData.o_finished_7),
          CO: this.getValue(rawData.o_completed_7),
        },
        gta: {
          SU: this.getValue(rawData.open_o_programme_8),
          APL: this.getValue(rawData.o_applied_8),
          ACH: this.getValue(rawData.o_matched_8),
          ACC: this.getValue(rawData.o_an_accepted_8),
          APD: this.getValue(rawData.o_approved_8),
          RE: this.getValue(rawData.o_realized_8),
          FIN: this.getValue(rawData.o_finished_8),
          CO: this.getValue(rawData.o_completed_8),
        },
        gte: {
          SU: this.getValue(rawData.open_o_programme_9),
          APL: this.getValue(rawData.o_applied_9),
          ACH: this.getValue(rawData.o_matched_9),
          ACC: this.getValue(rawData.o_an_accepted_9),
          APD: this.getValue(rawData.o_approved_9),
          RE: this.getValue(rawData.o_realized_9),
          FIN: this.getValue(rawData.o_finished_9),
          CO: this.getValue(rawData.o_completed_9),
        },
      },
      icx: {
        total: {
          SU: this.getValue(rawData.open_icx),
          APL: this.getValue(rawData.i_applied_7) + this.getValue(rawData.i_applied_8) + this.getValue(rawData.i_applied_9),
          ACH: this.getValue(rawData.i_matched_7) + this.getValue(rawData.i_matched_8) + this.getValue(rawData.i_matched_9),
          ACC: this.getValue(rawData.i_an_accepted_7) + this.getValue(rawData.i_an_accepted_8) + this.getValue(rawData.i_an_accepted_9),
          APD: this.getValue(rawData.i_approved_7) + this.getValue(rawData.i_approved_8) + this.getValue(rawData.i_approved_9),
          RE: this.getValue(rawData.i_realized_7) + this.getValue(rawData.i_realized_8) + this.getValue(rawData.i_realized_9),
          FIN: this.getValue(rawData.i_finished_7) + this.getValue(rawData.i_finished_8) + this.getValue(rawData.i_finished_9),
          CO: this.getValue(rawData.i_completed_7) + this.getValue(rawData.i_completed_8) + this.getValue(rawData.i_completed_9),
        },
        gv: {
          SU: this.getValue(rawData.open_i_programme_7),
          APL: this.getValue(rawData.i_applied_7),
          ACH: this.getValue(rawData.i_matched_7),
          ACC: this.getValue(rawData.i_an_accepted_7),
          APD: this.getValue(rawData.i_approved_7),
          RE: this.getValue(rawData.i_realized_7),
          FIN: this.getValue(rawData.i_finished_7),
          CO: this.getValue(rawData.i_completed_7),
        },
        gta: {
          SU: this.getValue(rawData.open_i_programme_8),
          APL: this.getValue(rawData.i_applied_8),
          ACH: this.getValue(rawData.i_matched_8),
          ACC: this.getValue(rawData.i_an_accepted_8),
          APD: this.getValue(rawData.i_approved_8),
          RE: this.getValue(rawData.i_realized_8),
          FIN: this.getValue(rawData.i_finished_8),
          CO: this.getValue(rawData.i_completed_8),
        },
        gte: {
          SU: this.getValue(rawData.open_i_programme_9),
          APL: this.getValue(rawData.i_applied_9),
          ACH: this.getValue(rawData.i_matched_9),
          ACC: this.getValue(rawData.i_an_accepted_9),
          APD: this.getValue(rawData.i_approved_9),
          RE: this.getValue(rawData.i_realized_9),
          FIN: this.getValue(rawData.i_finished_9),
          CO: this.getValue(rawData.i_completed_9),
        },
      },
    }
    return data
  }

  async getStatusProgressionData(
    startDate: string,
    endDate: string,
    officeId: number
  ): Promise<{ ogx: StatusProgressionData[], icx: StatusProgressionData[] }> {
    const months = this.generateMonthsInPeriod(startDate, endDate)
    const ogxProgression: StatusProgressionData[] = []
    const icxProgression: StatusProgressionData[] = []
    
    for (const month of months) {
      const monthStart = `${month}-01`
      const monthEnd = this.getLastDayOfMonth(month)
      
      try {
        const url = this._getApiUrl(`/api/analytics/progression?startDate=${monthStart}&endDate=${monthEnd}&officeId=${officeId}`)

        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${month}: ${response.statusText}`)
        }
        
        const monthlyData = await response.json()
        
        ogxProgression.push({
          month: month,
          apl: this.extractStatusCount(monthlyData, 'applied', 'ogx'),
          acc: this.extractStatusCount(monthlyData, 'accepted', 'ogx'), 
          apd: this.extractStatusCount(monthlyData, 'approved', 'ogx'),
          re: this.extractStatusCount(monthlyData, 'realized', 'ogx'),
          fin: this.extractStatusCount(monthlyData, 'finished', 'ogx'),
          co: this.extractStatusCount(monthlyData, 'completed', 'ogx')
        })
        icxProgression.push({
          month: month,
          apl: this.extractStatusCount(monthlyData, 'applied', 'icx'),
          acc: this.extractStatusCount(monthlyData, 'accepted', 'icx'), 
          apd: this.extractStatusCount(monthlyData, 'approved', 'icx'),
          re: this.extractStatusCount(monthlyData, 'realized', 'icx'),
          fin: this.extractStatusCount(monthlyData, 'finished', 'icx'),
          co: this.extractStatusCount(monthlyData, 'completed', 'icx')
        })
      } catch (error) {
        console.error(`Error fetching data for ${month}:`, error)
        ogxProgression.push({ month: month, apl: 0, acc: 0, apd: 0, re: 0, fin: 0, co: 0 })
        icxProgression.push({ month: month, apl: 0, acc: 0, apd: 0, re: 0, fin: 0, co: 0 })
      }
    }
    
    return { ogx: ogxProgression, icx: icxProgression }
  }
  
  private generateMonthsInPeriod(startDate: string, endDate: string): string[] {
    const months = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const current = new Date(start.getFullYear(), start.getMonth(), 1)
    
    while (current <= end) {
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      months.push(monthStr)
      current.setMonth(current.getMonth() + 1)
    }
    
    return months
  }
  
  private getLastDayOfMonth(monthStr: string): string {
    const [year, month] = monthStr.split('-').map(Number)
    const lastDay = new Date(year, month, 0).getDate()
    return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  }
  
  private extractStatusCount(data: PerformanceData, status: string, type: 'ogx' | 'icx'): number {
    const statusMapping = {
      'ogx': {
        'applied': ['o_applied_7', 'o_applied_8', 'o_applied_9'],
        'accepted': ['o_an_accepted_7', 'o_an_accepted_8', 'o_an_accepted_9'],
        'approved': ['o_approved_7', 'o_approved_8', 'o_approved_9'],
        'realized': ['o_realized_7', 'o_realized_8', 'o_realized_9'],
        'finished': ['o_finished_7', 'o_finished_8', 'o_finished_9'],
        'completed': ['o_completed_7', 'o_completed_8', 'o_completed_9']
      },
      'icx': {
        'applied': ['i_applied_7', 'i_applied_8', 'i_applied_9'],
        'accepted': ['i_an_accepted_7', 'i_an_accepted_8', 'i_an_accepted_9'],
        'approved': ['i_approved_7', 'i_approved_8', 'i_approved_9'],
        'realized': ['i_realized_7', 'i_realized_8', 'i_realized_9'],
        'finished': ['i_finished_7', 'i_finished_8', 'i_finished_9'],
        'completed': ['i_completed_7', 'i_completed_8', 'i_completed_9']
      }
    }
    
    const fields = statusMapping[type][status as keyof typeof statusMapping['ogx']] || []
    let total = 0
    
    for (const field of fields) {
      const key = field as keyof PerformanceData;
      if (data[key]) {
        total += this.getValue(data[key]);
      }
    }
    
    return total
  }
  
  public static getMandatePeriods(year: number) {
    const s1 = {
      id: `s1-${year}`,
      label: `Semestre 1: Fév-Jul ${year}`,
      startDate: `${year}-02-01`,
      endDate: `${year}-07-31`
    };
    const s2 = {
      id: `s2-${year}`,
      label: `Semestre 2: Aoû ${year} - Jan ${year + 1}`,
      startDate: `${year}-08-01`,
      endDate: `${year + 1}-01-31`
    };

    return {
      id: `mandate-${year}`,
      label: `Mandat ${year}/${year + 1}`,
      semesters: [s1, s2]
    };
  }
}