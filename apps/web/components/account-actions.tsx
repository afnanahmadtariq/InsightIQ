'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { authClient, webCallbackURL } from '../lib/auth-client'
import { Button, Field, FormMessage } from './ui'

function ReturnToSignIn() {
  return <p className="mt-0.5 mb-0 text-center text-[.86rem] text-iq-600 [&_a]:font-[650] [&_a]:text-brand"><Link href="/sign-in">Return to sign in</Link></p>
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const email = String(new FormData(event.currentTarget).get('email') || '').trim().toLowerCase()
    const result = await authClient.requestPasswordReset({ email, redirectTo: webCallbackURL('/reset-password') })
    if (result.error) setError(result.error.message || 'Could not send the reset link'); else setSent(true)
  }
  return <form className="grid gap-4 [&>button]:w-full" onSubmit={submit}><Field id="email" name="email" type="email" label="Email address" required/>{sent && <FormMessage tone="success">If an account exists, a reset link is on its way.</FormMessage>}{error && <FormMessage tone="error">{error}</FormMessage>}<Button type="submit">Send reset link</Button><ReturnToSignIn/></form>
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter(); const [error, setError] = useState(''); const [pending, setPending] = useState(false)
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError('')
    const form = new FormData(event.currentTarget); const password = String(form.get('password') || ''); const confirmation = String(form.get('confirmation') || '')
    if (password !== confirmation) { setError('Passwords do not match'); setPending(false); return }
    const result = await authClient.resetPassword({ newPassword: password, token })
    if (result.error) { setError(result.error.message || 'Could not update your password'); setPending(false); return }
    router.push('/sign-in?reset=complete')
  }
  return <form className="grid gap-4 [&>button]:w-full" onSubmit={submit}><Field id="password" name="password" type="password" label="New password" minLength={10} maxLength={128} required/><Field id="confirmation" name="confirmation" type="password" label="Confirm password" minLength={10} maxLength={128} required/>{error && <FormMessage tone="error">{error}</FormMessage>}<Button type="submit" disabled={pending || !token}>{pending ? 'Updating…' : 'Update password'}</Button></form>
}

export function VerifyEmailActions({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle'); const [error, setError] = useState('')
  async function resend() {
    setState('sending'); setError('')
    const result = await authClient.sendVerificationEmail({ email, callbackURL: webCallbackURL('/auth/continue') })
    if (result.error) { setError(result.error.message || 'Could not resend verification'); setState('idle') } else setState('sent')
  }
  return <div className="grid gap-4 [&>button]:w-full"><FormMessage>Open the verification link sent to <strong>{email || 'your email address'}</strong>. It expires in one hour.</FormMessage>{state === 'sent' && <FormMessage tone="success">A new verification email has been sent.</FormMessage>}{error && <FormMessage tone="error">{error}</FormMessage>}<Button type="button" variant="secondary" onClick={resend} disabled={!email || state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Resend verification email'}</Button><ReturnToSignIn/></div>
}
