'use client'

import { Bell, Building2, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import * as Popover from '@radix-ui/react-popover'
import { useEffect, useState, type ReactNode } from 'react'
import type { AccountContext } from '../lib/account-context'
import type { InsightNotification } from '../lib/research'
import { DashboardNav } from './dashboard-nav'
import { SignOutButton } from './sign-out-button'
import { Brand } from './ui'
import styles from './dashboard-shell.module.css'

export function DashboardShell({
  context,
  notifications,
  children,
}: {
  context: AccountContext & { activeWorkspace: NonNullable<AccountContext['activeWorkspace']> }
  notifications: InsightNotification[]
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const initials = context.user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const unreadNotifications = notifications.filter((item) => !item.readAt).length
  useEffect(() => {
    queueMicrotask(() => {
      setCollapsed(window.localStorage.getItem('insightiq-sidebar-collapsed') === 'true')
    })
  }, [])

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current
      window.localStorage.setItem('insightiq-sidebar-collapsed', String(next))
      return next
    })
  }

  return <div className={`${styles.shell} min-h-screen bg-iq-50 ${collapsed ? styles.collapsed : ''}`}>
    <aside className={`${styles.sidebar} flex flex-col`}>
      <div className={styles.sidebarHeader}>
        <Brand href="/dashboard"/>
        <button type="button" className={styles.collapseToggle} onClick={toggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
      </div>
      <div className={styles.workspace}>
        <span><Building2 size={17}/></span>
        <div><small>Workspace</small><strong>{context.activeWorkspace.name}</strong></div>
      </div>
      <DashboardNav collapsed={collapsed}/>
      <div className={styles.sidebarFoot}>
        <div className={styles.accountIdentity}><span className={styles.avatar}>{initials}</span><div><strong>{context.user.name}</strong><small>{context.user.email}</small></div></div>
        <SignOutButton className={styles.sidebarSignOut}/>
      </div>
    </aside>
    <div className={styles.stage}>
      <header className={styles.topbar}>
        <div><small>Active workspace</small><strong>{context.activeWorkspace.name}</strong></div>
        <div className={`${styles.actions} flex items-center`}>
          <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <Popover.Trigger asChild>
              <button type="button" className={styles.notification} aria-label={`${unreadNotifications} unread notifications`}>
                <Bell size={19}/>{unreadNotifications > 0 && <span>{Math.min(unreadNotifications, 9)}</span>}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className={`${styles.notificationPanel} z-50`} side="bottom" align="end" sideOffset={12} collisionPadding={20} aria-label="Notifications">
            <header><div><strong>Notifications</strong><small>{unreadNotifications ? `${unreadNotifications} unread` : 'You’re all caught up'}</small></div><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</button></header>
            {notifications.length ? <div className={styles.notificationItems}>{notifications.slice(0, 5).map((item) => {
              const content = <><span className={styles.notificationItemIcon}>{item.readAt ? <Check size={15}/> : <Search size={15}/>}</span><span><strong>{item.title}</strong><small>{item.body}</small></span></>
              return item.researchRun ? <Link key={item.id} href={`/dashboard/research/${item.researchRun.id}`} className={styles.notificationItem} onClick={() => setNotificationsOpen(false)}>{content}</Link> : <div key={item.id} className={styles.notificationItem}>{content}</div>
            })}</div> : <div className={styles.notificationEmpty}><Bell size={19}/><p>No notifications yet. When research moves, you’ll see it here.</p></div>}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  </div>
}
