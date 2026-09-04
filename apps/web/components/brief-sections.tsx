import { AlertTriangle, CircleHelp, Mail, MessageSquareQuote, ShieldCheck, Sparkles, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { CopyButton } from './ui/copy-button'

type BriefShape = {
  summary?: unknown
  talking_points?: unknown
  questions_to_ask?: unknown
  personalized_opener?: unknown
  objection_handling?: unknown
  next_steps?: unknown
  outreach_draft?: unknown
  gaps?: unknown
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())) : []
}

export function BriefSections({ sections, goal }: { sections: unknown; goal: 'meeting' | 'outreach' }) {
  if (!sections || typeof sections !== 'object') {
    return <div className="rounded-[15px] border border-dashed border-iq-300 p-[30px] text-center text-iq-600">This brief is still being prepared.</div>
  }

  const brief = sections as BriefShape
  const summary = text(brief.summary)
  const opener = text(brief.personalized_opener)
  const outreach = text(brief.outreach_draft)
  const talkingPoints = list(brief.talking_points)
  const questions = list(brief.questions_to_ask)
  const objections = list(brief.objection_handling)
  const nextSteps = list(brief.next_steps)
  const gaps = list(brief.gaps)

  return <div className="grid gap-4">
    <section className="relative overflow-hidden rounded-[20px] bg-iq-950 p-7 text-white shadow-panel max-[620px]:p-5">
      <span className="absolute -top-24 -right-14 size-72 rounded-full bg-sky/15 blur-3xl"/>
      <div className="relative z-1">
        <p className="mt-0 mb-3 flex items-center gap-2 text-[.7rem] font-bold tracking-[.12em] text-sky uppercase"><Sparkles size={15}/>Why this conversation matters</p>
        <p className="m-0 max-w-[780px] text-[clamp(1.18rem,2vw,1.55rem)] leading-[1.5] tracking-[-.015em] text-white">{summary || 'No strong public signal cleared the evidence threshold yet.'}</p>
        {opener && <div className="mt-6 rounded-2xl border border-white/12 bg-white/8 p-4">
          <div className="mb-2 flex items-center justify-between gap-3"><span className="text-[.68rem] font-bold tracking-[.1em] text-sky uppercase">Open with this</span><CopyButton value={opener} label="Copy opener"/></div>
          <blockquote className="m-0 text-sm leading-relaxed text-iq-100">“{opener}”</blockquote>
        </div>}
      </div>
    </section>

    {goal === 'outreach' && outreach && <section className="rounded-[18px] border border-brand-bright/25 bg-[#f4faff] p-6 max-[620px]:p-5">
      <div className="mb-4 flex items-center justify-between gap-3"><SectionTitle icon={<Mail size={18}/>} title="Ready-to-send draft"/><CopyButton value={outreach} label="Copy email"/></div>
      <p className="m-0 whitespace-pre-wrap text-sm leading-[1.75] text-iq-700">{outreach}</p>
    </section>}

    <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
      <ActionSection icon={<MessageSquareQuote size={18}/>} title={goal === 'meeting' ? 'Talk track' : 'Your angle'} items={talkingPoints}/>
      {goal === 'meeting' && <ActionSection icon={<CircleHelp size={18}/>} title="Questions to ask" items={questions}/>} 
      <ActionSection icon={<ShieldCheck size={18}/>} title="Likely objections" items={objections}/>
      <ActionSection icon={<Target size={18}/>} title="Best next step" items={nextSteps}/>
    </div>

    {gaps.length > 0 && <section className="flex gap-3 rounded-[15px] border border-[#ead7a8] bg-[#fffaf0] p-4 text-[#7a5717]">
      <AlertTriangle className="mt-0.5 shrink-0" size={18}/><div><strong className="text-sm">Verify before you use it</strong><ul className="mt-1.5 mb-0 grid gap-1 pl-4 text-xs leading-relaxed">{gaps.map((item) => <li key={item}>{item}</li>)}</ul></div>
    </section>}
  </div>
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return <div className="flex items-center gap-2.5 text-brand"><span className="grid size-9 place-items-center rounded-[11px] bg-iq-100">{icon}</span><h2 className="m-0 text-base text-iq-900">{title}</h2></div>
}

function ActionSection({ icon, title, items }: { icon: ReactNode; title: string; items: string[] }) {
  return <section className="rounded-[18px] border border-iq-200 bg-white p-5">
    <SectionTitle icon={icon} title={title}/>
    {items.length ? <ol className="mt-5 mb-0 grid gap-3 p-0">{items.map((item, index) => <li className="grid grid-cols-[26px_1fr] gap-2.5 text-sm leading-relaxed text-iq-700" key={`${title}-${item}`}><span className="grid size-[26px] place-items-center rounded-lg bg-iq-100 text-[.7rem] font-bold text-brand">{index + 1}</span><span>{item}</span></li>)}</ol> : <p className="mt-5 mb-0 text-sm text-iq-500">No recommendation was generated from the available evidence.</p>}
    {items.length > 0 && <div className="mt-5 flex justify-end"><CopyButton value={items.map((item, index) => `${index + 1}. ${item}`).join('\n')} label={`Copy ${title.toLowerCase()}`}/></div>}
  </section>
}
