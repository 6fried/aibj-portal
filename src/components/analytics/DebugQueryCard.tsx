'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Copy } from 'lucide-react'

interface DebugQueryCardProps {
  query: string
}

export function DebugQueryCard({ query }: DebugQueryCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(query).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [query])

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Generated GraphQL Query</CardTitle>
        <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="p-4 bg-gray-900 text-white rounded-md overflow-auto text-sm font-mono">
          {query}
        </pre>
      </CardContent>
    </Card>
  )
}
