'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { BarChart, Users } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const apps = [
    {
      title: 'Performance',
      description: 'Analyze operational performance.',
      href: '/apps/reports',
      icon: <BarChart className="h-8 w-8 text-aiesec-blue" />,
      enabled: true,
    },
    // {
    //   title: 'Reports',
    //   description: 'Generate term and team reports.',
    //   href: '/apps/reports',
    //   icon: <FileText className="h-8 w-8 text-aiesec-blue" />,
    //   enabled: false,
    // },
    {
      title: 'Team Management',
      description: 'Manage your teams and members.',
      href: '#',
      icon: <Users className="h-8 w-8 text-gray-400" />,
      enabled: false,
    },
  ]

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 bg-gray-50/50 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'AIESECer'}!</h1>
          <p className="text-muted-foreground">Select an application to get started.</p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {apps.map((app) => (
          <Link key={app.title} href={app.enabled ? app.href : '#'}>
            <Card className={`h-full transition-all hover:shadow-lg ${!app.enabled ? 'bg-gray-100 dark:bg-zinc-900 cursor-not-allowed opacity-70' : 'hover:scale-[1.02]'}`}>
              <CardHeader>
                {app.icon}
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-semibold">{app.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}