// src/components/layout/header.tsx
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AiesecLogo } from '@/components/ui/aiesec-logo'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth()

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <AiesecLogo size="lg" priority />
            <span className="text-xl font-bold text-aiesec-dark">
              AIESEC in Benin Portal
            </span>
          </Link>
          
          <nav className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-aiesec-gray animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard/performance">Performance</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/members">Members</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/events">Events</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <span>{user?.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-aiesec-dark/70">
                          {user?.entityName}
                        </span>
                        <span className="text-xs text-aiesec-dark/50">
                          {user?.role} {user?.department && `- ${user.department}`}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}