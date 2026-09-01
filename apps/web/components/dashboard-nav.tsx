'use client'

import { FileCheck2, LayoutDashboard, Plug, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/research', label: 'Research', icon: Search },
  { href: '/dashboard/evidence', label: 'Evidence', icon: FileCheck2 },
  { href: '/dashboard/briefs', label: 'Deal briefs', icon: Sparkles },
  { href: '/dashboard/integrations', label: 'Integrations', icon: Plug },
]

export function DashboardNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname()
  return <nav className={`grid gap-1 max-[900px]:mt-4 max-[900px]:flex max-[900px]:gap-[5px] max-[900px]:overflow-x-auto max-[900px]:[scrollbar-width:none] max-[900px]:[&::-webkit-scrollbar]:hidden ${collapsed ? 'w-full justify-items-center max-[900px]:w-auto max-[900px]:justify-items-normal' : ''}`} aria-label="Workspace navigation">
    {navigation.map(({ href, label, icon: Icon, exact }) => {
      const active = exact ? pathname === href : pathname.startsWith(href)
      return <Link key={href} href={href} className={`flex min-h-[43px] items-center gap-[11px] rounded-[11px] px-3 text-[.88rem] font-[550] text-iq-600 transition-colors duration-300 ease-fluid hover:bg-iq-100 hover:text-iq-900 [&_svg]:shrink-0 [&_svg]:[stroke-dasharray:48] [&_svg]:[stroke-dashoffset:0] hover:[&_svg]:animate-nav-icon max-[900px]:min-h-[39px] max-[900px]:shrink-0 max-[900px]:px-[11px] max-[560px]:w-[42px] max-[560px]:justify-center max-[560px]:px-0 max-[560px]:[&_span]:hidden motion-reduce:hover:[&_svg]:animate-none ${collapsed ? 'w-11 justify-center px-0 [&>span]:hidden max-[900px]:w-auto max-[900px]:justify-start max-[900px]:px-[11px] max-[900px]:[&>span]:inline max-[560px]:w-[42px] max-[560px]:justify-center max-[560px]:px-0 max-[560px]:[&>span]:hidden' : ''} ${active ? 'bg-[#e7f3ff] font-[650] text-brand' : ''}`} aria-current={active ? 'page' : undefined} aria-label={label} title={collapsed ? label : undefined}>
        <Icon size={18}/><span>{label}</span>
      </Link>
    })}
  </nav>
}
