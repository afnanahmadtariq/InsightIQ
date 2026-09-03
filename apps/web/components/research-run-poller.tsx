'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ResearchRunPoller({
  status,
  hasSources,
  hasBrief,
}: {
  status: string
  hasSources: boolean
  hasBrief: boolean
}) {
  const router = useRouter()

  useEffect(() => {
    if (status !== 'running' || !hasSources || hasBrief) return undefined
    const timer = window.setInterval(() => router.refresh(), 5000)
    return () => window.clearInterval(timer)
  }, [status, hasSources, hasBrief, router])

  return null
}
