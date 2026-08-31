import { ArrowLeft, FileCheck2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BriefSections } from '../../../../components/brief-sections'
import libraryStyles from '../../../../components/library.module.css'
import workspace from '../../../../components/workspace.module.css'
import { formatDate } from '../../../../lib/format'
import type { DealBriefDetail } from '../../../../lib/research'
import { authenticatedFetch } from '../../../../lib/server-auth'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brief = await authenticatedFetch<DealBriefDetail>(`/deal-briefs/${id}`).catch(() => null)
  if (!brief) notFound()
  return <div className={workspace.page}>
    <Link className={workspace.secondaryLink} href="/dashboard/briefs"><ArrowLeft size={15}/>All deal briefs</Link>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>{brief.researchRun.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'}</p><h1>{brief.title}</h1><p className={workspace.lead}>Prepared for {brief.researchRun.prospect.name}{brief.researchRun.prospect.companyName ? ` at ${brief.researchRun.prospect.companyName}` : ''} using citable evidence.</p></div><span className={workspace.badge} data-status={brief.status}><i/>{brief.status}</span></header>
    <section className={libraryStyles.briefIntro}><dl><div><dt>Prospect</dt><dd>{brief.researchRun.prospect.name}</dd></div><div><dt>Offer</dt><dd>{brief.researchRun.offer.name}</dd></div><div><dt>Evidence</dt><dd>{brief.researchRun.evidence.length} claims</dd></div><div><dt>Updated</dt><dd>{formatDate(brief.updatedAt)}</dd></div></dl></section>
    <div className={workspace.split}><section className={workspace.section}><div className={workspace.sectionHeader}><div><h2>Tailored brief</h2><p>Dynamic sections rendered from the structured synthesis output.</p></div></div><BriefSections sections={brief.sections}/></section><aside className={workspace.section}><div className={workspace.sectionHeader}><div><h2>Citation set</h2><p>Evidence used by this run.</p></div></div>{brief.researchRun.evidence.length ? <div className={workspace.list}>{brief.researchRun.evidence.map((item) => <a className={workspace.listItem} href={item.source.url} target="_blank" rel="noreferrer" key={item.id}><span className={workspace.itemIcon}><FileCheck2 size={17}/></span><div className={workspace.itemBody}><h3>{item.signalType}</h3><p>{item.source.title}</p></div></a>)}</div> : <div className={workspace.empty}><span><Sparkles size={20}/></span><h2>No citations attached</h2><p>This draft predates evidence normalization or is still awaiting citations.</p></div>}</aside></div>
    <Link href={`/dashboard/research/${brief.researchRun.id}`} className={workspace.secondaryLink}>Open source research</Link>
  </div>
}
