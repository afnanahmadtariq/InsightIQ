import type { ReactNode } from 'react'

export function StepCard({ number, icon, title, body, delay = '' }: { number: string; icon: ReactNode; title: string; body: string; delay?: string }) {
  return <article className={`group relative min-h-[235px] rounded-[19px] border border-[#dce9f5] bg-white p-7 shadow-[0_12px_36px_rgb(37_83_141_/_5%)] transition-[transform,border-color,box-shadow] duration-300 ease-fluid hover:-translate-y-1 hover:border-[#bdddf4] hover:shadow-card-hover motion-reduce:transition-none max-[900px]:min-h-0 ${delay}`} data-reveal>
    <span className="absolute top-[23px] right-6 text-[.68rem] font-semibold text-[#b4c3d6]">{number}</span>
    <div className="mb-[38px] grid size-[46px] place-items-center rounded-[14px] bg-[linear-gradient(145deg,#e8f7ff,#eaf0fd)] text-[1.2rem] text-[#1689da] transition-transform duration-300 ease-fluid group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transition-none max-[900px]:mb-[30px]">{icon}</div>
    <h3 className="mt-0 mb-[11px] text-[1.12rem] text-[#244973]">{title}</h3>
    <p className="m-0 text-[.96rem] leading-[1.6] text-[#7589a7]">{body}</p>
  </article>
}
