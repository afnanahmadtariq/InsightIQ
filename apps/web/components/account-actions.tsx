'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { authClient, webCallbackURL } from '../lib/auth-client'
import { Button, Field } from './ui'
import styles from './auth.module.css'

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('')
    const email = String(new FormData(event.currentTarget).get('email') || '').trim().toLowerCase()
    const result = await authClient.requestPasswordReset({ email, redirectTo: webCallbackURL('/reset-password') })
    if (result.error) setError(result.error.message || 'Could not send the reset link'); else setSent(true)
  }
  return <form className={styles.form} onSubmit={submit}><Field id="email" name="email" type="email" label="Email address" required/>{sent && <p className={styles.success}>If an account exists, a reset link is on its way.</p>}{error && <p className={styles.error}>{error}</p>}<Button type="submit">Send reset link</Button><p className={styles.center}><Link href="/sign-in">Return to sign in</Link></p></form>
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
  return <form className={styles.form} onSubmit={submit}><Field id="password" name="password" type="password" label="New password" minLength={10} maxLength={128} required/><Field id="confirmation" name="confirmation" type="password" label="Confirm password" minLength={10} maxLength={128} required/>{error && <p className={styles.error}>{error}</p>}<Button type="submit" disabled={pending || !token}>{pending ? 'Updating…' : 'Update password'}</Button></form>
}

export function VerifyEmailActions({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle'); const [error, setError] = useState('')
  async function resend() {
    setState('sending'); setError('')
    const result = await authClient.sendVerificationEmail({ email, callbackURL: webCallbackURL('/auth/continue') })
    if (result.error) { setError(result.error.message || 'Could not resend verification'); setState('idle') } else setState('sent')
  }
  return <div className={styles.form}><p className={styles.notice}>Open the verification link sent to <strong>{email || 'your email address'}</strong>. It expires in one hour.</p>{state === 'sent' && <p className={styles.success}>A new verification email has been sent.</p>}{error && <p className={styles.error}>{error}</p>}<Button type="button" variant="secondary" onClick={resend} disabled={!email || state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Resend verification email'}</Button><p className={styles.center}><Link href="/sign-in">Return to sign in</Link></p></div>
}
