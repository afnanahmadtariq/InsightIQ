import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InsightIQ — Evidence-first sales intelligence',
  description: 'Turn live prospect signals into focused meeting briefs and personalized outreach drafts with evidence one click away.',
  icons: {
    icon: '/insightiq-logo.svg',
    shortcut: '/insightiq-logo.svg',
    apple: '/insightiq-logo.svg',
  },
  openGraph: {
    title: 'InsightIQ — Know why now. Know what to say.',
    description: 'Evidence-first prospect research for agency SDRs and SaaS account executives.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'InsightIQ — Know why now. Know what to say.',
    description: 'Evidence-first prospect research for agency SDRs and SaaS account executives.',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
