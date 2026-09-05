'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ResearchRunPoller({ status }: { status: string; hasBrief?: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (status === 'completed' || status === 'failed') return undefined
    const timer = window.setInterval(() => router.refresh(), 5000)
    return () => window.clearInterval(timer)
  }, [status, router])

  return null
}
