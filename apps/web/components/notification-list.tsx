'use client'

import { Check, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiRequest } from '../lib/api-client'
import { formatDate } from '../lib/format'
import type { InsightNotification } from '../lib/research'
import styles from './library.module.css'

export function NotificationList({ initialNotifications }: { initialNotifications: InsightNotification[] }) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [pendingId, setPendingId] = useState('')
  const [error, setError] = useState('')

  async function markRead(id: string) {
    setPendingId(id)
    setError('')
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'POST' })
      setNotifications((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update this notification')
    } finally {
      setPendingId('')
    }
  }

  return <div className={styles.notificationList}>{error && <p className={styles.inlineError} role="alert">{error}</p>}{notifications.map((item) => <article key={item.id} data-read={Boolean(item.readAt)}>
    <span className={styles.notificationIcon}>{item.readAt ? <Check size={17}/> : <Search size={17}/>}</span>
    <div><header><h2>{item.title}</h2><time>{formatDate(item.createdAt, { year: undefined, hour: 'numeric', minute: '2-digit' })}</time></header><p>{item.body}</p><footer>{item.researchRun && <Link href={`/dashboard/research/${item.researchRun.id}`}>Open {item.researchRun.prospect.name}&apos;s research</Link>}{!item.readAt && <button type="button" disabled={pendingId === item.id} onClick={() => markRead(item.id)}>{pendingId === item.id ? 'Updating…' : 'Mark as read'}</button>}</footer></div>
  </article>)}</div>
}
