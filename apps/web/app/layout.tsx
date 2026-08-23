import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InsightIQ — Turn data into direction',
  description: 'InsightIQ turns complex information into clear, actionable direction.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body style={{ margin: 0 }}>{children}</body></html>
}
