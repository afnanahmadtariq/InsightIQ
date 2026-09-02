import type { ReactNode } from 'react'

export function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <p className={`mb-4 flex items-center gap-2 text-[.68rem] font-semibold tracking-[.13em] uppercase ${inverse ? 'text-sky' : 'text-brand-bright'}`}>
    <span className={`h-0.5 w-[18px] rounded-full ${inverse ? 'bg-sky' : 'bg-brand-bright'}`}/>{children}
  </p>
}
