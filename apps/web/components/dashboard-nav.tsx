'use client'

import { Bell, FileCheck2, LayoutDashboard, Plug, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './dashboard-shell.module.css'

const navigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/research', label: 'Research', icon: Search },
  { href: '/dashboard/evidence', label: 'Evidence', icon: FileCheck2 },
  { href: '/dashboard/briefs', label: 'Deal briefs', icon: Sparkles },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
]

export function DashboardNav() {
  const pathname = usePathname()
  return <nav className={styles.nav} aria-label="Workspace navigation">
    {navigation.map(({ href, label, icon: Icon, exact }) => {
      const active = exact ? pathname === href : pathname.startsWith(href)
      return <Link key={href} href={href} className={active ? styles.active : ''} aria-current={active ? 'page' : undefined}>
        <Icon size={18}/><span>{label}</span>
      </Link>
    })}
  </nav>
}
