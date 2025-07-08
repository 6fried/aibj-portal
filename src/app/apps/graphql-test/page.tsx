// Nouvelle page pour tester l'API GraphQL
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { DebugQueryCard } from '@/components/analytics/DebugQueryCard'
import { GraphQLResultCard } from '@/components/analytics/GraphQLResultCard'

const ogxMetrics = {
  signup: 'Signups',
  applied: 'Applied',
  accepted: 'Accepted',
  approved: 'Approved',
  realized: 'Realized',
  finished: 'Finished',
  completed: 'Completed',
};

const icxMetrics = {
  open: 'Open',
  applied: 'Applied',
  accepted: 'Accepted',
  approved: 'Approved',
  realized: 'Realized',
  finished: 'Finished',
  completed: 'Completed',
};

export default function GraphQLTestPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [filters, setFilters] = useState({
    from: '2025-02-01',
    to: '2025-07-07',
    entityId: '175',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/graphql-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),

      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'An error occurred')
      }

      const responseData = await response.json()
      setResult(responseData)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-2xl font-bold">GraphQL API Performance Test</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Query Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="from">From</Label>
            <Input id="from" name="from" type="date" value={filters.from} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" name="to" type="date" value={filters.to} onChange={handleInputChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="entityId">Entity ID</Label>
            <Input id="entityId" name="entityId" value={filters.entityId} onChange={handleInputChange} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
        Run Test Query
      </Button>

      {error && <p className="text-red-500">Error: {error}</p>}

      {result && (
        <div className="space-y-6">
          {result.ogx && <GraphQLResultCard title="OGX Performance Funnel" data={result.ogx.data} metrics={ogxMetrics} />}
          {result.icx && <GraphQLResultCard title="ICX Performance Funnel" data={result.icx.data} metrics={icxMetrics} />}
          {result.query && <DebugQueryCard query={result.query} />}
        </div>
      )}
    </main>
  )
}
