import { Check, ExternalLink, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'

export function DealBriefPreview() {
  return <div className="relative isolate animate-[riseIn_650ms_90ms_var(--ease-fluid)_both] motion-reduce:animate-none">
    <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full border border-brand-bright/15 bg-[radial-gradient(circle,rgb(89_188_248_/_10%),transparent_68%)] max-sm:-inset-5"/>
    <div className="absolute -top-6 -right-3 z-10 flex items-center gap-1.5 rounded-xl border border-iq-200 bg-white/95 px-3 py-2 text-xs font-semibold text-brand shadow-card max-sm:right-0">
      <Sparkles size={15}/><span>AI synthesis</span>
    </div>

    <article className="rounded-[22px] border border-iq-200 bg-white/95 p-6 shadow-panel max-sm:p-[18px]" aria-label="Example InsightIQ Deal Brief">
      <header className="flex items-center justify-between border-b border-iq-100 pb-4">
        <div className="flex items-center gap-2.5">
          <Image className="size-[30px] rounded-lg" src="/insightiq-logo.svg" alt="" width={30} height={30}/>
          <p className="m-0 grid gap-px"><b className="text-xs text-iq-900">Deal Brief</b><small className="text-[.62rem] text-iq-500">Prepared 2 minutes ago</small></p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#edf9f4] px-2.5 py-1.5 text-[.65rem] font-semibold text-success max-sm:hidden"><Check size={12}/> Evidence verified</span>
      </header>

      <section className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-5 max-sm:grid-cols-[auto_1fr]">
        <div className="grid size-12 place-items-center rounded-[14px] bg-iq-100 text-xs font-bold text-brand">AM</div>
        <div className="min-w-0"><h2 className="m-0 text-base text-iq-900">Alex Morgan</h2><p className="mt-1 mb-0 text-xs text-iq-500">VP of Revenue · Northstar Cloud</p></div>
        <span className="grid justify-items-end text-[.58rem] text-iq-500 uppercase max-sm:hidden"><b className="text-lg leading-none text-brand-bright">92%</b> offer fit</span>
      </section>

      <section className="grid grid-cols-[auto_1fr_auto] gap-3 rounded-[14px] border border-iq-200 bg-iq-50 p-4">
        <div className="grid size-[30px] place-items-center rounded-lg bg-[#e4f5ff] text-brand-bright"><TrendingUp size={16}/></div>
        <div className="min-w-0"><span className="text-[.62rem] font-semibold tracking-wider text-brand-bright uppercase">High-intent signal</span><h3 className="my-1 text-sm text-iq-900">Scaling the enterprise sales team</h3><p className="m-0 text-xs leading-normal text-iq-600">Northstar opened 14 enterprise roles after expanding into two new regions.</p></div>
        <a className="text-brand-bright" href="#evidence" aria-label="View source citation"><ExternalLink size={16}/></a>
      </section>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5 max-sm:grid-cols-1">
        <Angle label="Lead with">Faster ramp time for a distributed sales team.</Angle>
        <Angle label="Ask about">Consistency across new regional teams.</Angle>
      </div>
      <footer className="mt-4 flex justify-between gap-2 text-[.58rem] font-medium text-iq-500"><span>7 verified signals</span><span>3 strategic angles</span><span>5 cited sources</span></footer>
    </article>
  </div>
}

function Angle({ label, children }: { label: string; children: string }) {
  return <div className="rounded-xl border border-iq-100 p-3"><span className="text-[.59rem] font-semibold tracking-wider text-iq-500 uppercase">{label}</span><p className="mt-1 mb-0 text-xs leading-relaxed text-iq-700">{children}</p></div>
}
