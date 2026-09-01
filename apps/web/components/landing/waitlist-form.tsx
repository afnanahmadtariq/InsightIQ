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

  return <form className="delay-one grid grid-cols-[1fr_1.25fr] gap-2.5 rounded-[20px] border border-white/13 bg-white/7 p-[26px] backdrop-blur-xl max-[620px]:grid-cols-1 [&_label]:text-[.74rem] [&_label]:font-medium [&_label]:text-[#bdd0e5] [&_label:nth-of-type(2)]:col-start-2 [&_label:nth-of-type(2)]:row-start-1 max-[620px]:[&_label:nth-of-type(2)]:col-start-1 max-[620px]:[&_label:nth-of-type(2)]:row-auto [&_label_span]:ml-[5px] [&_label_span]:text-[#7895b8] [&_input]:min-w-0 [&_input]:rounded-[10px] [&_input]:border [&_input]:border-white/15 [&_input]:bg-white/9 [&_input]:px-3.5 [&_input]:py-[15px] [&_input]:text-[.92rem] [&_input]:text-white! [&_input]:outline-none [&_input]:transition-colors [&_input]:duration-300 [&_input]:ease-fluid [&_input]:placeholder:text-[#7894b6] [&_input:focus]:border-[#4bb5ec] [&_input:focus]:bg-white/12" data-reveal onSubmit={joinWaitlist}>
    <label htmlFor="name">Your name <span>Optional</span></label>
    <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" maxLength={120}/>
    <label htmlFor="email">Work email</label>
    <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" required maxLength={254}/>
    <Button className="col-span-full mt-1 w-full" type="submit" disabled={formState === 'submitting' || formState === 'success'}>
      <Mail size={17}/>
      {formState === 'submitting' ? 'Joining…' : formState === 'success' ? 'You’re on the list' : 'Join the waitlist'}
      {formState === 'idle' && <ArrowRight size={17}/>} 
    </Button>
    <p className={`col-span-full mt-0.5 mb-0 text-[.68rem] leading-[1.45] ${formState === 'error' ? 'text-[#ffb9bc]' : 'text-[#87a3c4]'}`} aria-live="polite">{message || 'By joining, you agree to receive occasional InsightIQ product updates.'}</p>
  </form>
}
