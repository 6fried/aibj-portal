'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { AiesecLogo } from '@/components/ui/aiesec-logo'
import Link from 'next/link'
import { BarChart3, Users, Calendar, BookOpen, TrendingUp, Activity, FileText } from 'lucide-react'

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

  const applications = [
    {
      id: 'performance',
      title: 'Performance Analytics',
      description: 'Suivi des performances d\'échanges entrants et sortants',
      icon: BarChart3,
      href: '/apps/performance',
      color: 'text-aiesec-blue',
      bgColor: 'bg-blue-50',
      available: true,
    },
    {
      id: 'reports',
      title: 'Reports & Analytics',
      description: 'Rapports détaillés et analyses de progression',
      icon: FileText,
      href: '/apps/reports',
      color: 'text-aiesec-purple',
      bgColor: 'bg-purple-50',
      available: true,
    },
    {
      id: 'members',
      title: 'Member Management',
      description: 'Gestion des membres et de l\'équipe',
      icon: Users,
      href: '/dashboard/members',
      color: 'text-aiesec-green',
      bgColor: 'bg-green-50',
      available: false,
    },
    {
      id: 'events',
      title: 'Event Management',
      description: 'Organisation et suivi des événements',
      icon: Calendar,
      href: '/dashboard/events',
      color: 'text-aiesec-orange',
      bgColor: 'bg-orange-50',
      available: false,
    },
    {
      id: 'learning',
      title: 'Learning Hub',
      description: 'Plateforme d\'apprentissage et formations',
      icon: BookOpen,
      href: '/dashboard/learning',
      color: 'text-aiesec-purple',
      bgColor: 'bg-purple-50',
      available: false,
    },
    {
      id: 'finance',
      title: 'Finance Tracker',
      description: 'Suivi financier et budgets',
      icon: TrendingUp,
      href: '/dashboard/finance',
      color: 'text-aiesec-teal',
      bgColor: 'bg-teal-50',
      available: false,
    },
    {
      id: 'operations',
      title: 'Operations Dashboard',
      description: 'Tableaux de bord opérationnels',
      icon: Activity,
      href: '/dashboard/operations',
      color: 'text-aiesec-yellow',
      bgColor: 'bg-yellow-50',
      available: false,
    },
  ]

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

        {/* Section Applications */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-aiesec-dark mb-4">
            Applications disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applications.map((app) => {
              const IconComponent = app.icon
              
              if (app.available) {
                return (
                  <Link key={app.id} href={app.href}>
                    <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-aiesec-blue">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${app.bgColor}`}>
                            <IconComponent className={`w-6 h-6 ${app.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-aiesec-dark">{app.title}</CardTitle>
                          </div>
                        </div>
                        <CardDescription>{app.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-aiesec-blue">
                            Disponible
                          </span>
                          <div className="w-2 h-2 bg-aiesec-green rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              } else {
                return (
                  <Card key={app.id} className="opacity-60 cursor-not-allowed">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100`}>
                          <IconComponent className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <CardTitle className="text-gray-500">{app.title}</CardTitle>
                        </div>
                      </div>
                      <CardDescription className="text-gray-400">{app.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-400">
                          Bientôt disponible
                        </span>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                )
              }
            })}
          </div>
        </div>

        {/* Section Activités récentes */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Activités récentes</CardTitle>
              <CardDescription>
                Vos dernières interactions avec AIESEC
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-aiesec-blue rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Consultation Performance Analytics</p>
                    <p className="text-xs text-aiesec-dark/70">Il y a quelques minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-aiesec-green rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Connexion au portail AIESEC in Benin</p>
                    <p className="text-xs text-aiesec-dark/70">{`Aujourd'hui`}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-aiesec-orange rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Mise à jour du profil utilisateur</p>
                    <p className="text-xs text-aiesec-dark/70">Il y a 2 jours</p>
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