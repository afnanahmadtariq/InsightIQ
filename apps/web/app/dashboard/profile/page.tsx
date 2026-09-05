import { ProfileSettings } from '../../../components/profile-settings'
import { WorkspaceHeader, WorkspacePage } from '../../../components/workspace/workspace-page'
import { requireWorkspace } from '../../../lib/server-auth'

export default async function Page() {
  const context = await requireWorkspace()

  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Account" title="Profile & security" lead="Review your account details and protect access to your research workspace."/>
    <ProfileSettings user={context.user} workspace={context.activeWorkspace}/>
  </WorkspacePage>
}
