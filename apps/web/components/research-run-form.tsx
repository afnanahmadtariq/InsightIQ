'use client'

import { ArrowRight, BriefcaseBusiness, Building2, ChevronDown, Mail, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'
import { apiRequest } from '../lib/api-client'
import type { ResearchRunSummary } from '../lib/research'
import { Button } from './ui/button'
import { Field } from './ui/form-field'
import { FormMessage } from './ui/form-message'

export function ResearchRunForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const optional = (name: string) => String(form.get(name) || '').trim() || undefined
    try {
      const run = await apiRequest<ResearchRunSummary>('/research-runs', {
        method: 'POST',
        body: JSON.stringify({
          prospectName: optional('prospectName'),
          prospectEmail: optional('prospectEmail'),
          companyName: optional('companyName'),
          companyDomain: optional('companyDomain'),
          linkedinUrl: optional('linkedinUrl'),
          xHandle: optional('xHandle'),
          offerName: optional('offerName'),
          offerContext: optional('offerContext'),
          targetPersona: optional('targetPersona'),
          goal: form.get('goal'),
        }),
      })
      router.push(`/dashboard/research/${run.id}`)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not queue this research run')
      setPending(false)
    }
  }

  const cardClass = 'rounded-[18px] border border-iq-200 bg-white p-6 shadow-card max-[700px]:p-5'
  const gridClass = 'grid grid-cols-2 gap-4 max-[700px]:grid-cols-1'
  const labelClass = 'col-span-full grid gap-2 text-sm font-semibold text-iq-700'
  const controlClass = 'w-full rounded-xl border border-iq-300 bg-white px-3.5 py-3 text-iq-950 outline-none transition focus:border-brand-bright focus:ring-3 focus:ring-brand-bright/10'

  return <form className="grid gap-[18px]" onSubmit={submit}>
    <section className={cardClass}>
      <FormSectionHeader icon={<UserRound/>} title="Who are you researching?" description="Add any identifiers you already trust."/>
      <div className={gridClass}>
        <Field id="prospect-name" name="prospectName" label="Prospect name" placeholder="Maya Chen" required icon={<UserRound size={18}/>}/>
        <Field id="prospect-email" name="prospectEmail" type="email" label="Email (optional)" placeholder="maya@company.com" icon={<Mail size={18}/>}/>
        <Field id="company-name" name="companyName" label="Company (optional)" placeholder="Northstar Labs" icon={<Building2 size={18}/>}/>
        <Field id="company-domain" name="companyDomain" label="Company domain (optional)" placeholder="northstar.com"/>
        <Field id="linkedin-url" name="linkedinUrl" type="url" label="LinkedIn URL (optional)" placeholder="https://linkedin.com/in/…"/>
        <Field id="x-handle" name="xHandle" label="X handle (optional)" placeholder="@mayachen"/>
      </div>
    </section>
    <section className={cardClass}>
      <FormSectionHeader icon={<BriefcaseBusiness/>} title="What are you selling?" description="Give the agent enough context to find meaningful alignment."/>
      <div className={gridClass}>
        <Field id="offer-name" name="offerName" label="Offer name" placeholder="Enterprise analytics platform" required/>
        <Field id="target-persona" name="targetPersona" label="Target persona (optional)" placeholder="VP Sales at B2B SaaS"/>
        <label className={labelClass}><span>Value proposition and context</span><textarea className={`${controlClass} min-h-[130px] resize-y leading-relaxed`} name="offerContext" minLength={20} maxLength={4000} placeholder="Explain the problem you solve, your strongest differentiators, and the outcome you create…" required/></label>
        <label className={labelClass}><span>Research goal</span><span className="relative block"><select className={`${controlClass} appearance-none pr-11`} name="goal" defaultValue="meeting"><option value="meeting">Prepare for a meeting</option><option value="outreach">Create personalized outreach</option></select><ChevronDown className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-iq-600" size={18} aria-hidden="true"/></span></label>
      </div>
    </section>
    {error && <FormMessage tone="error" className="text-[.8rem]">{error}</FormMessage>}
    <Button className="min-w-[210px] justify-self-start" type="submit" disabled={pending}>{pending ? 'Queuing research…' : 'Start research run'}{!pending && <ArrowRight size={18}/>}</Button>
  </form>
}

function FormSectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <header className="mb-6 flex gap-3 text-brand-bright"><span>{icon}</span><div><h2 className="m-0 text-lg text-iq-900">{title}</h2><p className="mt-1 mb-0 text-sm text-iq-600">{description}</p></div></header>
}
