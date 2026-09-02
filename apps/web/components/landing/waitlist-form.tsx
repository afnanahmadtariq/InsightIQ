'use client'

import { ArrowRight, Mail } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { Button } from '../ui/button'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://api-insightiq.zerotools.online'

export function WaitlistForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function joinWaitlist(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormState('submitting')
    setMessage('')

    try {
      const response = await fetch(`${apiUrl}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null
        throw new Error(payload?.message ?? 'We could not save your email. Please try again.')
      }

      setFormState('success')
      setMessage('You’re on the list. We’ll send the first signal when InsightIQ is ready.')
      setName('')
      setEmail('')
    } catch (error) {
      setFormState('error')
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  const labelClass = 'text-xs font-medium text-iq-300'
  const inputClass = 'min-w-0 rounded-control border border-white/15 bg-white/10 px-3.5 py-3.5 text-sm text-white outline-none transition placeholder:text-iq-500 focus:border-sky focus:bg-white/15'

  return <form className="delay-one grid grid-cols-2 gap-2.5 rounded-panel border border-white/15 bg-white/5 p-6 backdrop-blur-xl max-sm:grid-cols-1" data-reveal onSubmit={joinWaitlist}>
    <label className={labelClass} htmlFor="name">Your name <span className="ml-1 text-iq-500">Optional</span></label>
    <input className={inputClass} id="name" name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" maxLength={120}/>
    <label className={`${labelClass} col-start-2 row-start-1 max-sm:col-start-1 max-sm:row-auto`} htmlFor="email">Work email</label>
    <input className={inputClass} id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" required maxLength={254}/>
    <Button className="col-span-full mt-1 w-full" type="submit" disabled={formState === 'submitting' || formState === 'success'}>
      <Mail size={17}/>
      {formState === 'submitting' ? 'Joining…' : formState === 'success' ? 'You’re on the list' : 'Join the waitlist'}
      {formState === 'idle' && <ArrowRight size={17}/>} 
    </Button>
    <p className={`col-span-full m-0 text-xs leading-relaxed ${formState === 'error' ? 'text-[#ffb9bc]' : 'text-iq-500'}`} aria-live="polite">{message || <>By joining, you agree to receive occasional InsightIQ product updates. See our <a className="font-semibold text-sky underline-offset-2 hover:underline" href="/privacy">Privacy Policy</a>.</>}</p>
  </form>
}
