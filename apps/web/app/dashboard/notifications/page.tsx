import { Bell } from 'lucide-react'
import { NotificationList } from '../../../components/notification-list'
import workspace from '../../../components/workspace.module.css'
import type { InsightNotification } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

export default async function Page() {
  const notifications = await authenticatedFetch<InsightNotification[]>('/notifications') ?? []
  return <div className={workspace.page}>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>Notifications</p><h1>Research, when it moves.</h1><p className={workspace.lead}>Completion and attention signals will collect here without blocking the rest of your workspace.</p></div></header>
    <section className={workspace.section}>{notifications.length ? <NotificationList initialNotifications={notifications}/> : <div className={workspace.empty}><span><Bell size={20}/></span><h2>No notifications yet</h2><p>The delivery surface is ready. Future workers can notify the requesting user when evidence or a deal brief completes.</p></div>}</section>
  </div>
}
