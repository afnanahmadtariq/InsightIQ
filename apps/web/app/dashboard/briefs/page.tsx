import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'
import libraryStyles from '../../../components/library.module.css'
import workspace from '../../../components/workspace.module.css'
import { formatDate } from '../../../lib/format'
import type { DealBriefSummary } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

export default async function Page() {
  const briefs = await authenticatedFetch<DealBriefSummary[]>('/deal-briefs') ?? []
  return <div className={workspace.page}>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>Deal briefs</p><h1>From evidence to action.</h1><p className={workspace.lead}>Meeting preparation and outreach drafts belong here only after every supporting claim can point back to a public source.</p></div><Link className={workspace.primaryLink} href="/dashboard/research/new"><Plus size={17}/>New research run</Link></header>
    <section className={workspace.section}>
      <div className={workspace.sectionHeader}><div><h2>Generated briefs</h2><p>{briefs.length} tailored outputs in this workspace.</p></div></div>
      {briefs.length ? <div className={libraryStyles.briefList}>{briefs.map((brief) => <Link href={`/dashboard/briefs/${brief.id}`} className={libraryStyles.briefCard} key={brief.id}><header><span className={workspace.badge} data-status={brief.status}><i/>{brief.status}</span><Sparkles size={18}/></header><h2>{brief.title}</h2><p>{brief.researchRun?.prospect.name}{brief.researchRun?.prospect.companyName ? ` · ${brief.researchRun.prospect.companyName}` : ''} connected to {brief.researchRun?.offer.name}.</p><footer><span><span>{brief.researchRun?._count.sources ?? 0} sources</span><span>{brief.researchRun?._count.evidence ?? 0} claims</span></span><b>{formatDate(brief.updatedAt, { year: undefined })}<ArrowRight size={13}/></b></footer></Link>)}</div> : <div className={workspace.empty}><span><Sparkles size={20}/></span><h2>No deal briefs yet</h2><p>Brief synthesis follows source discovery and evidence normalization. The page is ready for dynamic meeting and outreach sections.</p><Link href="/dashboard/research">Review research runs</Link></div>}
    </section>
  </div>
}
