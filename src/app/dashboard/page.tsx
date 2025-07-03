'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { AiesecLogo } from '@/components/ui/aiesec-logo'

export default function DashboardPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <AiesecLogo size="md" className="animate-pulse" />
            <span>Loading...</span>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-aiesec-dark mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-aiesec-dark/70">
            {user?.role} at {user?.entityName}
            {user?.department && ` - ${user.department}`}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-aiesec-blue">My Applications</CardTitle>
              <CardDescription>
                Track your exchange applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aiesec-dark">3</div>
              <p className="text-sm text-aiesec-dark/70">Active applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-aiesec-green">Events</CardTitle>
              <CardDescription>
                Upcoming AIESEC events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aiesec-dark">5</div>
              <p className="text-sm text-aiesec-dark/70">Events this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-aiesec-orange">Learning</CardTitle>
              <CardDescription>
                Your learning progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-aiesec-dark">78%</div>
              <p className="text-sm text-aiesec-dark/70">Completion rate</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your latest interactions with AIESEC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-aiesec-blue rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Applied for Global Volunteer in Brazil</p>
                    <p className="text-xs text-aiesec-dark/70">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-aiesec-green rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Attended Leadership Workshop</p>
                    <p className="text-xs text-aiesec-dark/70">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-aiesec-orange rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Completed AIESEC Way training</p>
                    <p className="text-xs text-aiesec-dark/70">2 weeks ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </main>
  )
}