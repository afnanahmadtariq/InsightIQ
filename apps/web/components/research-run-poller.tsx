'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

function RouteStatusPoller({ active }: { active: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return undefined
    const timer = window.setInterval(() => router.refresh(), 5000)
    return () => window.clearInterval(timer)
  }, [active, router])

  return null
}

export function ResearchRunPoller({ status }: { status: string }) {
  return <RouteStatusPoller active={status !== 'completed' && status !== 'failed'}/>
}

export function BriefStatusPoller({ status }: { status: string }) {
  return <RouteStatusPoller active={status === 'refreshing'}/>
}
