import type { Metadata } from 'next'
import { OnboardingForm } from '../../components/onboarding-form'
import { Brand } from '../../components/ui'
import { requireAccountContext } from '../../lib/server-auth'
import styles from '../../components/auth.module.css'
export const metadata: Metadata = { title: 'Create workspace · InsightIQ' }
export default async function Page() { const context = await requireAccountContext(); return <main className={styles.onboardingPage}><header className={styles.topbar}><Brand/><p>Signed in as {context.user.email}</p></header><section className={styles.onboardingContent}><p>Workspace setup</p><h1>Where your deal intelligence lives.</h1><span>Create a private workspace for your prospects, offers, evidence, and research briefs.</span><OnboardingForm context={context}/></section></main> }
