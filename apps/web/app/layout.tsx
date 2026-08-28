import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InsightIQ — Evidence-first sales intelligence',
  description: 'Research prospects, uncover timely sales signals, and generate tailored Deal Briefs with a citation behind every claim.',
  icons: {
    icon: '/insightiq-logo.svg',
    shortcut: '/insightiq-logo.svg',
    apple: '/insightiq-logo.svg',
  },
  openGraph: {
    title: 'InsightIQ — Know the prospect. Earn the conversation.',
    description: 'Evidence-first AI sales intelligence for outreach, meetings, and every high-value conversation.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'InsightIQ — Know the prospect. Earn the conversation.',
    description: 'Evidence-first AI sales intelligence for outreach, meetings, and every high-value conversation.',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  )
}
