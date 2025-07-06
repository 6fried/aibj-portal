// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/members', '/events', '/profile', '/apps']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si l'utilisateur a un token d'accès
  const accessToken = request.cookies.get('aiesec_access_token')
  const isAuthenticated = !!accessToken

  // Si on est sur une route protégée sans être authentifié
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si on est authentifié et qu'on essaie d'accéder à la page de login
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/members/:path*', '/events/:path*', '/profile/:path*', '/apps/:path*']
}