import { SecuritySettings } from '../../../components/security-settings'
import { WorkspaceHeader, WorkspacePage } from '../../../components/workspace/workspace-page'
import { requireWorkspace } from '../../../lib/server-auth'

export default async function Page() {
  const context = await requireWorkspace()

  return <WorkspacePage>
    <WorkspaceHeader eyebrow="Account" title="Settings & security" lead="Manage sign-in protection and your personal account."/>
    <SecuritySettings user={context.user} accountDeletion={context.accountDeletion}/>
  </WorkspacePage>
}
