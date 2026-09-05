import { ProfileDetails } from '../../../components/profile-details'
import { WorkspaceHeader, WorkspacePage } from '../../../components/workspace/workspace-page'
import { requireWorkspace } from '../../../lib/server-auth'

export default async function Page() {
  const context = await requireWorkspace()

  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Account" title="Profile" lead="Review the details shown in your workspace."/>
    <ProfileDetails user={context.user} workspace={context.activeWorkspace}/>
  </WorkspacePage>
}
