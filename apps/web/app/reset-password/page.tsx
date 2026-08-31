import type { Metadata } from 'next'
import { ResetPasswordForm } from '../../components/account-actions'
import { AuthShell } from '../../components/auth-shell'
export const metadata: Metadata = { title: 'Choose a new password · InsightIQ' }
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) { const { token = '' } = await searchParams; return <AuthShell mode="sign-in"><h2>Choose a new password</h2><p>Use a unique password with at least 10 characters.</p><ResetPasswordForm token={token}/></AuthShell> }
