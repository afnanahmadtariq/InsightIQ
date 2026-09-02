import type { Metadata } from 'next'
import Link from 'next/link'
import { AuthForm } from '../../components/auth-form'
import { AuthIntro, AuthShell } from '../../components/auth-shell'

export const metadata: Metadata = { title: 'Sign in · InsightIQ' }
export default function SignInPage() { return <AuthShell mode="sign-in"><AuthIntro title="Sign in to InsightIQ">New here? <Link className="font-semibold text-brand" href="/sign-up">Create an account</Link></AuthIntro><AuthForm mode="sign-in"/></AuthShell> }
