import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionManager } from '@/components/auth/session-manager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AIESEC in Benin Portal',
  description: 'Your gateway to leadership development and global opportunities',
  icons: {
    icon: [
      { url: '/images/favicons/favicon.ico' },
      { url: '/images/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/images/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/images/favicons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/favicons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/images/favicons/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SessionManager />
      </body>
    </html>
  )
}