import { redirect } from 'next/navigation'
import { getAccountContext } from '../../../lib/server-auth'
export default async function Page() { const context = await getAccountContext(); redirect(context?.destination || '/sign-in') }
