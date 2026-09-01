import Link from 'next/link'
import type { ReactNode } from 'react'

export function WorkspaceList({ children }: { children: ReactNode }) {
  return <div className="grid gap-[9px]">{children}</div>
}

export function WorkspaceListLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="flex min-h-[82px] items-center gap-[15px] rounded-[14px] border border-iq-200 bg-white px-[17px] py-[15px] transition-[border-color,background-color,box-shadow] duration-300 ease-fluid hover:border-iq-300 hover:bg-iq-50/50 hover:shadow-card motion-reduce:transition-none max-[620px]:flex-wrap max-[620px]:items-start">{children}</Link>
}

export function ItemIcon({ children }: { children: ReactNode }) {
  return <span className="grid size-[38px] shrink-0 place-items-center rounded-[11px] bg-iq-100 text-brand">{children}</span>
}

export function ItemBody({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1 [&_h2]:mt-0 [&_h2]:mb-1 [&_h2]:truncate [&_h2]:text-[.94rem] [&_h2]:text-iq-900 [&_h3]:mt-0 [&_h3]:mb-1 [&_h3]:truncate [&_h3]:text-[.94rem] [&_h3]:text-iq-900 [&_p]:m-0 [&_p]:truncate [&_p]:text-[.8rem] [&_p]:text-iq-500">{children}</div>
}

export function ItemMeta({ children }: { children: ReactNode }) {
  return <div className="grid shrink-0 justify-items-end gap-1.5 text-[.72rem] text-iq-500 max-[620px]:w-full max-[620px]:grid-flow-col max-[620px]:justify-between max-[620px]:justify-items-start max-[620px]:pl-[53px]">{children}</div>
}
