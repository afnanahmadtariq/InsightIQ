'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import type { AccountContext } from '../lib/account-context'
import { authClient } from '../lib/auth-client'
import { Button, Field, FormMessage } from './ui'

export function TwoFactorChallenge({ context }: { context: AccountContext }) {
  const router = useRouter(); const [code, setCode] = useState(''); const [pending, setPending] = useState(false); const [error, setError] = useState(''); const [sent, setSent] = useState(false)
  async function send() { setPending(true); const result = await authClient.twoFactor.sendOtp(); if (result.error) setError(result.error.message || 'Could not send code'); else setSent(true); setPending(false) }
  async function verify(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); const result = await authClient.twoFactor.verifyOtp({ code }); if (result.error) { setError(result.error.message || 'Invalid code'); setPending(false); return } router.push('/auth/continue'); router.refresh() }
  return <form className="grid gap-4 [&>button]:w-full" onSubmit={verify}><FormMessage>{sent ? `A code was sent to ${context.user.email}.` : 'Send a one-time code to your verified email.'}</FormMessage>{!sent && <Button type="button" variant="secondary" onClick={send} disabled={pending}>Send email code</Button>}<Field id="code" name="code" label="Six-digit security code" inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required/>{error && <FormMessage tone="error">{error}</FormMessage>}<Button type="submit" disabled={pending || !sent || code.length !== 6}>{pending ? 'Checking…' : 'Verify identity'}</Button></form>
}
