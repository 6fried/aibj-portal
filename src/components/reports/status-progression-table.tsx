'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface StatusProgressionData {
  month: string
  apl: number
  acc: number
  apd: number
  re: number
  fin: number
  co: number
}

interface StatusProgressionTableProps {
  data: StatusProgressionData[]
}

export function StatusProgressionTable({ data }: StatusProgressionTableProps) {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-')
    const monthNames = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
      'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
    ]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const getTotal = (statusKey: keyof Omit<StatusProgressionData, 'month'>) => {
    return data.reduce((sum, item) => sum + item[statusKey], 0)
  }

  const statusLabels = {
    apl: 'APL (Applied)',
    acc: 'ACC (Accepted)', 
    apd: 'APD (Approved)',
    re: 'RE (Realized)',
    fin: 'FIN (Finished)',
    co: 'CO (Completed)'
  }

  return (
    <>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-3 font-semibold text-aiesec-dark">
                  Statut
                </th>
                {data.map((item) => (
                  <th key={item.month} className="text-center p-3 font-semibold text-aiesec-dark min-w-[80px]">
                    {formatMonth(item.month)}
                  </th>
                ))}
                <th className="text-center p-3 font-semibold text-aiesec-blue">
                  Total
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {Object.entries(statusLabels).map(([statusKey, statusLabel]) => (
                <tr key={statusKey} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium text-aiesec-dark">
                    {statusLabel}
                  </td>
                  {data.map((item) => (
                    <td key={item.month} className="text-center p-3">
                      <span className={`inline-block min-w-[40px] py-1 px-2 rounded text-sm font-medium ${
                        item[statusKey as keyof Omit<StatusProgressionData, 'month'>] > 0 
                          ? 'bg-aiesec-blue/10 text-aiesec-blue' 
                          : 'text-gray-400'
                      }`}>
                        {item[statusKey as keyof Omit<StatusProgressionData, 'month'>]}
                      </span>
                    </td>
                  ))}
                  <td className="text-center p-3">
                    <span className="inline-block min-w-[40px] py-1 px-2 rounded text-sm font-bold bg-aiesec-blue text-white">
                      {getTotal(statusKey as keyof Omit<StatusProgressionData, 'month'>)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            
          </table>
        </div>

        {/* Légende */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-aiesec-dark mb-2">Légende des statuts :</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            <div><strong>APL</strong> : Applications soumises</div>
            <div><strong>ACC</strong> : Applications acceptées</div>
            <div><strong>APD</strong> : Applications approuvées</div>
            <div><strong>RE</strong> : Applications réalisées</div>
            <div><strong>FIN</strong> : Applications terminées</div>
            <div><strong>CO</strong> : Applications complétées</div>
          </div>
        </div>
      </>
  )
}