import { ResearchRunForm } from '../../../../components/research-run-form'
import workspace from '../../../../components/workspace.module.css'

export default function Page() {
  return <div className={workspace.page}>
    <header className={workspace.pageHeader}><div><p className={workspace.eyebrow}>New research run</p><h1>Connect the evidence to your offer.</h1><p className={workspace.lead}>Give InsightIQ trusted identifiers and enough offer context to search with purpose—without biasing what counts as evidence.</p></div></header>
    <ResearchRunForm/>
  </div>
}
