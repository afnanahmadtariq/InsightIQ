import { Bell, Building2 } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { AccountContext } from '../lib/account-context'
import { DashboardNav } from './dashboard-nav'
import { SignOutButton } from './sign-out-button'
import { Brand } from './ui'
import styles from './dashboard-shell.module.css'

export function DashboardShell({
  context,
  unreadNotifications,
  children,
}: {
  context: AccountContext & { activeWorkspace: NonNullable<AccountContext['activeWorkspace']> }
  unreadNotifications: number
  children: ReactNode
}) {
  const initials = context.user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <Brand href="/dashboard"/>
      <div className={styles.workspace}>
        <span><Building2 size={17}/></span>
        <div><small>Workspace</small><strong>{context.activeWorkspace.name}</strong></div>
      </div>
      <DashboardNav/>
      <div className={styles.sidebarFoot}>
        <span className={styles.avatar}>{initials}</span>
        <div><strong>{context.user.name}</strong><small>{context.user.email}</small></div>
      </div>
    </aside>
    <div className={styles.stage}>
      <header className={styles.topbar}>
        <div><small>Active workspace</small><strong>{context.activeWorkspace.name}</strong></div>
        <div className={styles.actions}>
          <Link href="/dashboard/notifications" className={styles.notification} aria-label={`${unreadNotifications} unread notifications`}>
            <Bell size={19}/>{unreadNotifications > 0 && <span>{Math.min(unreadNotifications, 9)}</span>}
          </Link>
          <SignOutButton/>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  </div>
}
