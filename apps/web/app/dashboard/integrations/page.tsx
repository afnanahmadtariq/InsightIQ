import { Check, CircleDashed, Plug, Search, Sparkles } from 'lucide-react'
import { StatusBadge, WorkspaceHeader, WorkspacePage, WorkspaceSection, WorkspaceSplit } from '../../../components/workspace-ui'
import type { IntegrationCapabilities } from '../../../lib/research'
import { authenticatedFetch } from '../../../lib/server-auth'

const descriptions: Record<string, string> = {
  intake: 'Tenant-safe prospect and offer inputs are stored with an immutable run snapshot.',
  'source-discovery': 'Parallel Tavily searches collect and deduplicate public source records.',
  'evidence-normalization': 'Next: extract bounded claims, confidence, dates, and source relationships.',
  'brief-synthesis': 'Planned: generate meeting or outreach sections from accepted evidence only.',
  'notification-delivery': 'Planned: emit completion events to in-app and transactional channels.',
}

export default async function Page() {
  const capabilities = await authenticatedFetch<IntegrationCapabilities>('/integrations')
  if (!capabilities) return null

  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Pipeline readiness" title="Build from a clear boundary." lead="See what is operational today and where the evidence worker, synthesis service, and event delivery should connect next."/>
    <WorkspaceSplit>
      <section className="rounded-[17px] border border-iq-200 bg-white p-[23px]"><header className="flex items-center justify-between gap-4"><span className="grid size-[42px] place-items-center rounded-xl bg-[linear-gradient(135deg,#dff4ff,#e2ecff)] text-brand"><Search size={20}/></span><StatusBadge status={capabilities.webDiscovery.status}/></header><h2 className="mt-5 mb-[7px] text-[1.08rem] text-iq-900">{capabilities.webDiscovery.provider} web discovery</h2><p className="m-0 text-[.83rem] leading-[1.6] text-iq-600">{capabilities.webDiscovery.status === 'configured' ? 'A dedicated project API key is configured for reliable production discovery.' : 'The SDK is active in shared keyless evaluation mode. Add TAVILY_API_KEY to production before sustained usage.'}</p><dl className="mt-5 mb-0 grid grid-cols-2 gap-2.5 [&>div]:rounded-[11px] [&>div]:bg-iq-50 [&>div]:p-[11px] [&_dt]:text-[.65rem] [&_dt]:tracking-[.06em] [&_dt]:text-iq-500 [&_dt]:uppercase [&_dd]:mt-[5px] [&_dd]:mb-0 [&_dd]:text-[.8rem] [&_dd]:text-iq-900"><div><dt>Search depth</dt><dd>{capabilities.webDiscovery.searchDepth}</dd></div><div><dt>Results per query</dt><dd>{capabilities.webDiscovery.maxResults}</dd></div></dl></section>
      <WorkspaceSection title="Architecture boundary" description="The next services consume the records already stored by the API."><div className="grid min-h-[186px] content-between rounded-[17px] border border-iq-200 bg-white p-[21px]"><span className="grid size-[38px] place-items-center rounded-[11px] bg-iq-100 text-brand"><Plug size={19}/></span><div><h3 className="mt-[22px] mb-[7px] text-[1.03rem] text-iq-900">Worker contract</h3><p className="m-0 text-[.87rem] leading-[1.55] text-iq-600">Research runs, sources, evidence, briefs, and notifications already share tenant-safe compound relationships.</p></div><footer className="mt-[22px] flex items-center justify-between gap-2.5 text-[.77rem] font-[650] text-brand">PostgreSQL is the current handoff <Sparkles size={15}/></footer></div></WorkspaceSection>
    </WorkspaceSplit>
    <WorkspaceSection title="End-to-end stages" description="Ready, next, and planned status for further implementation."><div className="grid gap-[9px]">{capabilities.stages.map((stage, index) => <article className="flex items-center gap-[13px] rounded-[14px] border border-iq-200 bg-white p-[17px]" key={stage.id}><span className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-iq-100 text-brand">{stage.status === 'ready' ? <Check size={17}/> : <CircleDashed size={17}/>}</span><div className="flex-1"><h2 className="mt-0 mb-[3px] text-[.9rem] text-iq-900">{String(index + 1).padStart(2, '0')} · {stage.label}</h2><p className="m-0 text-[.75rem] text-iq-500">{descriptions[stage.id]}</p></div><StatusBadge status={stage.status}/></article>)}</div></WorkspaceSection>
  </WorkspacePage>
}
