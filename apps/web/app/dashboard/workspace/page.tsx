import { WorkspaceSettings } from '../../../components/workspace-settings'
import { WorkspaceHeader, WorkspacePage } from '../../../components/workspace/workspace-page'
import { authenticatedFetch } from '../../../lib/server-auth'
import type { WorkspaceSettingsContext } from '../../../lib/workspace-settings'

export default async function Page() {
  const settings = await authenticatedFetch<WorkspaceSettingsContext>('/workspace-settings')
  if (!settings) return null

  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Workspace" title="Workspace settings" lead="Manage the people, shared data, and identity of this sales workspace."/>
    <WorkspaceSettings initial={settings}/>
  </WorkspacePage>
}
