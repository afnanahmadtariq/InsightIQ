import { FileCheck2, Search, Sparkles } from 'lucide-react'
import { SignOutButton } from '../../components/sign-out-button'
import { Brand } from '../../components/ui'
import { requireWorkspace } from '../../lib/server-auth'
import styles from './page.module.css'
export default async function Page() { const context = await requireWorkspace(); return <main className={styles.page}><header><Brand/><div><span>{context.activeWorkspace.name}</span><SignOutButton/></div></header><section className={styles.hero}><p>Intelligence workspace</p><h1>Good morning, {context.user.name.split(' ')[0]}.</h1><span>Start with a prospect and the offer you want to connect to their current situation.</span><button><Search size={19}/>Start a research run</button></section><section className={styles.cards}><article><Search/><h2>Research queue</h2><p>Asynchronous prospect research will appear here.</p></article><article><FileCheck2/><h2>Evidence library</h2><p>Every verified source and signal stays traceable.</p></article><article><Sparkles/><h2>Deal briefs</h2><p>Turn evidence into outreach and meeting preparation.</p></article></section></main> }
