import type { Metadata } from 'next'
import { VerifyEmailActions } from '../../components/account-actions'
import { AuthShell } from '../../components/auth-shell'
export const metadata: Metadata = { title: 'Verify email · InsightIQ' }
export default async function Page({ searchParams }: { searchParams: Promise<{ email?: string }> }) { const { email = '' } = await searchParams; return <AuthShell mode="sign-up"><h2>Check your inbox</h2><p>Verify your email before entering your intelligence workspace.</p><VerifyEmailActions email={email}/></AuthShell> }
