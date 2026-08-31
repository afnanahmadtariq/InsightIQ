'use client'

import { RefreshCw, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiRequest } from '../lib/api-client'
import type { ResearchRunSummary } from '../lib/research'
import { Button } from './ui'
import styles from './research.module.css'

type DiscoveryResult = {
  sourcesCollected: number
  queriesCompleted: number
  failedQueries: number
}

export function ResearchRunActions({ run }: { run: Pick<ResearchRunSummary, 'id' | 'status'> }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<DiscoveryResult | null>(null)

  async function discover() {
    setPending(true)
    setError('')
    setResult(null)
    try {
      if (run.status === 'failed') {
        await apiRequest(`/research-runs/${run.id}/retry`, { method: 'POST' })
      }
      const response = await apiRequest<DiscoveryResult>(`/research-runs/${run.id}/discover`, { method: 'POST' })
      setResult(response)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not start source discovery')
    } finally {
      setPending(false)
    }
  }

  if (run.status === 'completed') return null
  if (run.status === 'running') {
    return <Button variant="secondary" type="button" onClick={() => router.refresh()}><RefreshCw size={17}/>Refresh status</Button>
  }

  return <div className={styles.runActions}>
    <Button type="button" onClick={discover} disabled={pending}>
      {pending ? <RefreshCw className={styles.spin} size={17}/> : <Search size={17}/>}
      {pending ? 'Collecting public sources…' : run.status === 'failed' ? 'Retry source discovery' : 'Collect public sources'}
    </Button>
    {result && <p>{result.sourcesCollected} sources collected across {result.queriesCompleted} searches.</p>}
    {error && <p className={styles.error}>{error}</p>}
  </div>
}
