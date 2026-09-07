import type { Metadata } from 'next'
import { NotFoundPage } from '../components/error-page'

export const metadata: Metadata = {
  title: 'Page not found · InsightIQ',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundPage/>
}
