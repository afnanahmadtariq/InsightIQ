import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthForm } from '../../components/auth-form'
import { AuthIntro, AuthShell } from '../../components/auth-shell'

export const metadata: Metadata = { title: 'Create account · InsightIQ' }
export default function SignUpPage() { return <AuthShell mode="sign-up"><AuthIntro title="Create your account">Already using InsightIQ? <Link className="font-semibold text-brand" href="/sign-in">Sign in</Link></AuthIntro><AuthForm mode="sign-up"/></AuthShell> }
