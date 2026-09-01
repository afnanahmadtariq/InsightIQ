import { ResearchRunForm } from '../../../../components/research-run-form'
import { WorkspaceHeader, WorkspacePage } from '../../../../components/workspace/workspace-page'

export default function Page() {
  return <WorkspacePage>
    <WorkspaceHeader eyebrow="New research run" title="Connect the evidence to your offer." lead="Give InsightIQ trusted identifiers and enough offer context to search with purpose—without biasing what counts as evidence."/>
    <ResearchRunForm/>
  </WorkspacePage>
}
