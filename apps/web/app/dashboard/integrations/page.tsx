import { Check, CircleDashed, Plug, Search, Sparkles } from 'lucide-react'
import libraryStyles from '../../../components/library.module.css'
import workspace from '../../../components/workspace.module.css'
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
  return <div className={workspace.page}>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>Pipeline readiness</p><h1>Build from a clear boundary.</h1><p className={workspace.lead}>See what is operational today and where the evidence worker, synthesis service, and event delivery should connect next.</p></div></header>
    <div className={workspace.split}>
      <section className={libraryStyles.integrationCard}><header><span><Search size={20}/></span><span className={workspace.badge} data-status={capabilities.webDiscovery.status}><i/>{capabilities.webDiscovery.status}</span></header><h2>{capabilities.webDiscovery.provider} web discovery</h2><p>{capabilities.webDiscovery.status === 'configured' ? 'A dedicated project API key is configured for reliable production discovery.' : 'The SDK is active in shared keyless evaluation mode. Add TAVILY_API_KEY to production before sustained usage.'}</p><dl><div><dt>Search depth</dt><dd>{capabilities.webDiscovery.searchDepth}</dd></div><div><dt>Results per query</dt><dd>{capabilities.webDiscovery.maxResults}</dd></div></dl></section>
      <section className={workspace.section}><div className={workspace.sectionHeader}><div><h2>Architecture boundary</h2><p>The next services consume the records already stored by the API.</p></div></div><div className={workspace.featureCard}><span><Plug size={19}/></span><div><h3>Worker contract</h3><p>Research runs, sources, evidence, briefs, and notifications already share tenant-safe compound relationships.</p></div><footer>PostgreSQL is the current handoff <Sparkles size={15}/></footer></div></section>
    </div>
    <section className={workspace.section}><div className={workspace.sectionHeader}><div><h2>End-to-end stages</h2><p>Ready, next, and planned status for further implementation.</p></div></div><div className={libraryStyles.pipeline}>{capabilities.stages.map((stage, index) => <article key={stage.id}><span>{stage.status === 'ready' ? <Check size={17}/> : <CircleDashed size={17}/>}</span><div><h2>{String(index + 1).padStart(2, '0')} · {stage.label}</h2><p>{descriptions[stage.id]}</p></div><span className={workspace.badge} data-status={stage.status}><i/>{stage.status}</span></article>)}</div></section>
  </div>
}
