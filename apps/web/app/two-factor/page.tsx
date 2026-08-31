import { redirect } from 'next/navigation'
import { TwoFactorChallenge } from '../../components/two-factor-challenge'
import { Brand } from '../../components/ui'
import { requireAccountContext } from '../../lib/server-auth'
import styles from '../../components/auth.module.css'
export default async function Page() { const context = await requireAccountContext(); if (!context.requirements.requiresTwoFactorChallenge) redirect(context.destination); return <main className={styles.securityPage}><section className={styles.securityCard}><Brand/><h1>Verify it is you</h1><p>Complete this security check before opening your workspace.</p><TwoFactorChallenge context={context}/></section></main> }
