import type { ReactNode } from 'react'

export function Eyebrow({ children, inverse = false }: { children: ReactNode; inverse?: boolean }) {
  return <p className={`mb-[17px] flex items-center gap-[9px] text-[.68rem] font-semibold tracking-[.13em] uppercase ${inverse ? 'text-[#5ec1f2] [&>span]:bg-[#5ec1f2]' : 'text-[#1687dc] [&>span]:bg-[#28a5ef]'}`}><span className="h-0.5 w-[18px] rounded-full"/>{children}</p>
}
