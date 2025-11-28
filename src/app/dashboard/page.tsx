'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { BarChart, GitCompareArrows, UserPlus, FileSearch } from 'lucide-react'
import Image from 'next/image'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const apps = [
    {
      title: 'Performance',
      description: 'Track key performance indicators and operational metrics.',
      href: '/apps/reports',
      icon: <BarChart className="h-10 w-10 text-primary" />,
      enabled: true,
    },
    {
      title: 'E2E Analytics',
      description: 'Analyze end-to-end exchange program performance.',
      href: '/apps/e2e-analytics',
      icon: <GitCompareArrows className="h-10 w-10 text-primary" />,
      enabled: true,
    },
    {
      title: 'Recruitment',
      description: 'Manage recruitment campaigns and candidate pipelines.',
      href: '/apps/recruitment',
      icon: <UserPlus className="h-10 w-10 text-primary" />,
      enabled: true,
    },
    {
      title: 'Leads',
      description: 'Monitor and manage incoming leads and inquiries.',
      href: '/apps/leads',
      icon: <FileSearch className="h-10 w-10 text-primary" />,
      enabled: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <svg className="h-5 w-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
              </svg>
            </div>
            <span className="text-lg font-semibold text-foreground">AIESEC Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            {user?.image && (
              <Image
                src={user.image} 
                alt={user.name || 'User'} 
                className="h-8 w-8 rounded-full border border-border"
                width={32}
                height={32}
              />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {`Welcome back, ${user?.name?.split(' ')[0] || 'AIESECer'}!`}
            </h1>
            <p className="text-muted-foreground">
              {`Here's your quick access to the AIESEC management modules.`}
            </p>
          </div>

          {/* App Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {apps.map((app) => (
              <Link key={app.title} href={app.enabled ? app.href : '#'}>
                <Card className={`h-full transition-all hover:shadow-md border border-border ${
                  !app.enabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                        {app.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{app.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{app.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            {`© 2024 AIESEC. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  )
}