'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy } from 'lucide-react';

interface DebugQueryCardProps {
  query: string;
  rawResponse: any;
}

export function DebugQueryCard({ query, rawResponse }: DebugQueryCardProps) {
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [copiedResponse, setCopiedResponse] = useState(false);

  const copyToClipboard = (text: string, setCopied: (isCopied: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Generated GraphQL Query</h3>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(query, setCopiedQuery)} className="gap-2">
              {copiedQuery ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copiedQuery ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="p-4 bg-gray-900 text-white rounded-md overflow-auto text-sm font-mono">
            {query}
          </pre>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Raw JSON Response</h3>
            <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(rawResponse, null, 2), setCopiedResponse)} className="gap-2">
              {copiedResponse ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              {copiedResponse ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          <pre className="p-4 bg-gray-900 text-white rounded-md overflow-auto text-sm font-mono">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
