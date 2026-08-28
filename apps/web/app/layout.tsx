import type { Metadata } from 'next'
import { PersonaProvider } from '@/lib/persona-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'InsightIQ — Evidence-first AI sales intelligence',
  description:
    'InsightIQ turns a prospect and your offer into a cited Deal Brief — signals, talking points, and outreach drafts, every claim traceable to its source.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PersonaProvider>{children}</PersonaProvider>
      </body>
    </html>
  )
}
