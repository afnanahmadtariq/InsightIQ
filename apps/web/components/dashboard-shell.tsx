'use client'

import * as Popover from '@radix-ui/react-popover'
import { Bell, Building2, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import type { AccountContext } from '../lib/account-context'
import type { InsightNotification } from '../lib/research'
import { DashboardNav } from './dashboard-nav'
import { SignOutButton } from './sign-out-button'
import { Brand } from './ui/brand'
import { Button } from './ui/button'

function NotificationEntry({ item, onSelect }: { item: InsightNotification; onSelect: () => void }) {
  const content = <>
    <span className="mt-px grid size-[30px] place-items-center rounded-[9px] bg-iq-100 text-brand">{item.readAt ? <Check size={15}/> : <Search size={15}/>}</span>
    <span className="grid min-w-0 gap-[3px]"><strong className="truncate text-[.79rem] text-iq-900">{item.title}</strong><small className="line-clamp-2 text-[.72rem] leading-[1.4] tracking-normal text-iq-600 normal-case">{item.body}</small></span>
  </>
  const className = 'grid grid-cols-[auto_1fr] gap-[11px] border-b border-iq-100 px-4 py-3.5 text-inherit no-underline transition-colors duration-300 ease-fluid last:border-b-0 hover:bg-iq-50 motion-reduce:transition-none'
  return item.researchRun
    ? <Link href={`/dashboard/research/${item.researchRun.id}`} className={className} onClick={onSelect}>{content}</Link>
    : <div className={className}>{content}</div>
}

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

  return <div className={`grid min-h-screen bg-iq-50 bg-[radial-gradient(circle_at_92%_0%,#e7f5ff_0,transparent_26%)] transition-[grid-template-columns] duration-300 ease-fluid motion-reduce:transition-none ${collapsed ? 'grid-cols-[84px_minmax(0,1fr)] max-[900px]:grid-cols-1' : 'grid-cols-[252px_minmax(0,1fr)] max-[900px]:grid-cols-1'}`}>
    <aside className={`sticky top-0 z-5 flex h-screen flex-col border-r border-iq-200 bg-white/88 py-5 pt-[25px] backdrop-blur-2xl transition-[padding] duration-300 ease-fluid motion-reduce:transition-none max-[900px]:static max-[900px]:block max-[900px]:h-auto max-[900px]:w-full max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:p-[18px] ${collapsed ? 'px-0' : 'px-[18px]'}`}>
      <div className={`relative flex min-h-9 items-center justify-between max-[900px]:m-0 [&>a]:text-iq-900 ${collapsed ? 'mb-6 w-full justify-center [&>a_span]:hidden' : 'mx-2 mb-7'}`}>
        <Brand href="/dashboard"/>
        <Button type="button" variant="ghost" size="icon-sm" className={`max-[900px]:hidden ${collapsed ? 'absolute top-6 -right-3.5 z-10 size-7! bg-white' : ''}`} onClick={toggleSidebar} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
        </Button>
      </div>

      {!collapsed && <div className="mb-[23px] flex items-center gap-[11px] rounded-[14px] border border-iq-200 bg-iq-50 p-3 max-[900px]:hidden">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-iq-100 text-brand"><Building2 size={17}/></span>
        <div className="grid min-w-0 gap-0.5"><small className="text-[.67rem] tracking-[.07em] text-iq-500 uppercase">Workspace</small><strong className="truncate text-[.83rem] text-iq-900">{context.activeWorkspace.name}</strong></div>
      </div>}

      <DashboardNav collapsed={collapsed}/>

      <div className={`mt-auto flex shrink-0 flex-col gap-2.5 border-t border-iq-200 pt-[15px] max-[900px]:hidden ${collapsed ? 'w-full items-center px-0' : 'px-2'}`}>
        <div className={`flex min-w-0 items-center gap-2.5 ${collapsed ? 'justify-center [&>div]:hidden' : ''}`}>
          <span className="grid size-[35px] shrink-0 place-items-center rounded-[11px] bg-[linear-gradient(135deg,#dff3ff,#dce8ff)] text-[.72rem] font-[750] text-iq-900">{initials}</span>
          <div className="grid min-w-0 gap-0.5"><strong className="truncate text-[.8rem] text-iq-900">{context.user.name}</strong><small className="truncate text-[.69rem] text-iq-500">{context.user.email}</small></div>
        </div>
        <SignOutButton compact={collapsed}/>
      </div>
    </aside>

    <div className="min-w-0">
      <header className="flex h-[76px] items-center justify-between gap-5 border-b border-iq-200 bg-iq-50/72 px-[34px] backdrop-blur-xl max-[900px]:h-16 max-[900px]:px-5 max-[560px]:[&>div:first-child]:max-w-[170px]">
        <div className="grid gap-0.5"><small className="text-[.68rem] tracking-[.07em] text-iq-500 uppercase">Active workspace</small><strong className="text-[.9rem] text-iq-900 max-[560px]:truncate">{context.activeWorkspace.name}</strong></div>
        <div className="flex items-center gap-[9px]">
          <Popover.Root open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <Popover.Trigger asChild>
              <Button type="button" variant="secondary" size="icon" className="relative text-iq-600 hover:text-brand data-[state=open]:border-iq-300 data-[state=open]:bg-iq-50 data-[state=open]:text-brand" aria-label={`${unreadNotifications} unread notifications`}>
                <Bell size={19}/>{unreadNotifications > 0 && <span className="absolute -top-[5px] -right-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-white bg-brand px-1 text-[.62rem] font-bold text-white">{Math.min(unreadNotifications, 9)}</span>}
              </Button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="z-100 w-[min(370px,calc(100vw_-_40px))] overflow-hidden rounded-[15px] border border-iq-200 bg-white data-[state=open]:animate-notification-in" side="bottom" align="end" sideOffset={12} collisionPadding={20} aria-label="Notifications">
                <header className="flex items-center justify-between border-b border-iq-200 px-4 py-[15px]"><div className="grid gap-[3px]"><strong className="text-[.88rem]">Notifications</strong><small className="text-[.68rem] tracking-normal text-iq-500 normal-case">{unreadNotifications ? `${unreadNotifications} unread` : 'You’re all caught up'}</small></div><Button type="button" variant="ghost" size="icon-sm" className="size-7! text-xl leading-none text-iq-500" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications">×</Button></header>
                {notifications.length
                  ? <div className="grid max-h-[360px] overflow-auto">{notifications.slice(0, 5).map((item) => <NotificationEntry key={item.id} item={item} onSelect={() => setNotificationsOpen(false)}/>)}</div>
                  : <div className="grid justify-items-start gap-2.5 px-4 py-[22px] text-iq-500"><Bell className="text-brand" size={19}/><p className="m-0 max-w-[260px] text-[.78rem] leading-normal">No notifications yet. When research moves, you’ll see it here.</p></div>}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1180px] px-[38px] pt-12 pb-20 max-[900px]:px-5 max-[900px]:pt-[38px] max-[900px]:pb-16">{children}</main>
    </div>
  </div>
}
