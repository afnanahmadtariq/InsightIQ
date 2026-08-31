import { FileCheck2, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { SignOutButton } from '../../components/sign-out-button'
import { Brand } from '../../components/ui'
import { requireWorkspace } from '../../lib/server-auth'
import styles from './page.module.css'
export default async function Page() { const context = await requireWorkspace(); return <main className={styles.page}><header><Brand/><div><span>{context.activeWorkspace.name}</span><SignOutButton/></div></header><section className={styles.hero}><p>Intelligence workspace</p><h1>Good morning, {context.user.name.split(' ')[0]}.</h1><span>Start with a prospect and the offer you want to connect to their current situation.</span><Link href="/dashboard/research/new"><Search size={19}/>Start a research run</Link></section><section className={styles.cards}><Link href="/dashboard/research"><Search/><h2>Research queue</h2><p>Track asynchronous prospect research.</p></Link><article><FileCheck2/><h2>Evidence library</h2><p>Every verified source and signal stays traceable.</p></article><article><Sparkles/><h2>Deal briefs</h2><p>Turn evidence into outreach and meeting preparation.</p></article></section></main> }
