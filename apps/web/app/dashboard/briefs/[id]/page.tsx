import { ArrowLeft, FileCheck2, Sparkles } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BriefSections } from '../../../../components/brief-sections'
import { ButtonLink } from '../../../../components/ui/button'
import { EmptyState } from '../../../../components/ui/empty-state'
import { StatusBadge } from '../../../../components/ui/status-badge'
import { WorkspaceHeader, WorkspacePage, WorkspaceSection, WorkspaceSplit } from '../../../../components/workspace/workspace-page'
import { ItemBody, ItemIcon } from '../../../../components/workspace/workspace-list'
import { formatDate } from '../../../../lib/format'
import type { DealBriefDetail } from '../../../../lib/research'
import { authenticatedFetch } from '../../../../lib/server-auth'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brief = await authenticatedFetch<DealBriefDetail>(`/deal-briefs/${id}`).catch(() => null)
  if (!brief) notFound()

  return <WorkspacePage>
    <ButtonLink href="/dashboard/briefs" variant="secondary"><ArrowLeft size={15}/>All deal briefs</ButtonLink>
    <WorkspaceHeader eyebrow={brief.researchRun.goal === 'meeting' ? 'Meeting preparation' : 'Personalized outreach'} title={brief.title} lead={<>Prepared for {brief.researchRun.prospect.name}{brief.researchRun.prospect.companyName ? ` at ${brief.researchRun.prospect.companyName}` : ''} using citable evidence.</>} action={<StatusBadge status={brief.status}/>}/>

    <section className="rounded-[17px] border border-iq-200 bg-white p-[22px]"><dl className="m-0 grid grid-cols-4 gap-4 max-[680px]:grid-cols-2 [&_dt]:text-[.66rem] [&_dt]:tracking-[.07em] [&_dt]:text-iq-500 [&_dt]:uppercase [&_dd]:mt-1.5 [&_dd]:mb-0 [&_dd]:text-[.85rem] [&_dd]:leading-[1.45] [&_dd]:text-iq-900"><div><dt>Prospect</dt><dd>{brief.researchRun.prospect.name}</dd></div><div><dt>Offer</dt><dd>{brief.researchRun.offer.name}</dd></div><div><dt>Evidence</dt><dd>{brief.researchRun.evidence.length} claims</dd></div><div><dt>Updated</dt><dd>{formatDate(brief.updatedAt)}</dd></div></dl></section>

    <WorkspaceSplit>
      <WorkspaceSection title="Tailored brief" description="Dynamic sections rendered from the structured synthesis output."><BriefSections sections={brief.sections}/></WorkspaceSection>
      <WorkspaceSection title="Citation set" description="Evidence used by this run.">
        {brief.researchRun.evidence.length ? <div className="grid gap-[9px]">{brief.researchRun.evidence.map((item) => <a className="flex min-h-[82px] items-center gap-[15px] rounded-[14px] border border-iq-200 bg-white px-[17px] py-[15px] transition-[border-color,box-shadow] duration-300 ease-fluid hover:border-iq-300 hover:shadow-card motion-reduce:transition-none max-[620px]:flex-wrap max-[620px]:items-start" href={item.source.url} target="_blank" rel="noreferrer" key={item.id}><ItemIcon><FileCheck2 size={17}/></ItemIcon><ItemBody><h3>{item.signalType}</h3><p>{item.source.title}</p></ItemBody></a>)}</div> : <EmptyState icon={<Sparkles size={20}/>} title="No citations attached" body="This draft predates evidence normalization or is still awaiting citations."/>}
      </WorkspaceSection>
    </WorkspaceSplit>
    <ButtonLink href={`/dashboard/research/${brief.researchRun.id}`} variant="secondary">Open source research</ButtonLink>
  </WorkspacePage>
}
