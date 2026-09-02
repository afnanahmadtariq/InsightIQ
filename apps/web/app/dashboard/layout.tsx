import type { ReactNode } from 'react'
import { DashboardShell } from '../../components/dashboard-shell'
import type { InsightNotification } from '../../lib/research'
import { authenticatedFetch, requireWorkspace } from '../../lib/server-auth'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const context = await requireWorkspace()
  const notifications = await authenticatedFetch<InsightNotification[]>('/notifications').catch(() => []) ?? []
  return <DashboardShell context={context} notifications={notifications}>
    {children}
  </DashboardShell>
}
