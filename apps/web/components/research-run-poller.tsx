'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ResearchRunPoller({ status, hasBrief }: { status: string; hasBrief: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (status !== 'running' || hasBrief) return undefined
    const timer = window.setInterval(() => router.refresh(), 5000)
    return () => window.clearInterval(timer)
  }, [status, hasBrief, router])

  return null
}
