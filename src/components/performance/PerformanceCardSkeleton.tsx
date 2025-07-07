import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PerformanceCardSkeleton() {
  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-3/5" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-4 w-1/4 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-5 w-2/5" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
