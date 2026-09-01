import Link from 'next/link'
import type { ReactNode } from 'react'

export function WorkspacePage({ children }: { children: ReactNode }) {
  return <div className="grid gap-[30px] animate-[page-in_420ms_ease_both]">{children}</div>
}

export function WorkspaceHeader({ eyebrow, title, lead, action }: { eyebrow: string; title: ReactNode; lead: ReactNode; action?: ReactNode }) {
  return <header className="flex items-end justify-between gap-7 max-[620px]:flex-col max-[620px]:items-start">
    <div className="max-w-[720px]"><p className="mt-0 mb-2.5 text-[.69rem] font-[650] tracking-[.12em] text-brand-bright uppercase">{eyebrow}</p><h1 className="m-0 text-[clamp(2.45rem,5vw,4.35rem)] leading-[1.02] font-light tracking-[-.06em] text-iq-900 max-[620px]:text-[2.65rem]">{title}</h1><p className="mt-4 mb-0 max-w-[650px] text-[1.02rem] leading-[1.65] text-iq-600">{lead}</p></div>
    {action}
  </header>
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-[45px] shrink-0 items-center justify-center gap-2 rounded-[11px] bg-[linear-gradient(135deg,#1c9eec,#16429b)] px-4 text-[.84rem] font-[650] text-white! hover:brightness-95">{children}</Link>
}

export function SecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="inline-flex min-h-[45px] shrink-0 items-center justify-center gap-2 rounded-[11px] border border-iq-200 bg-white px-4 text-[.84rem] font-[650] text-iq-900 hover:border-iq-300 hover:bg-iq-50">{children}</Link>
}

export function MetricGrid({ children, label }: { children: ReactNode; label?: string }) {
  return <section className="grid grid-cols-4 gap-3 max-[850px]:grid-cols-2" aria-label={label}>{children}</section>
}

export function MetricCard({ icon, value, label }: { icon: ReactNode; value: ReactNode; label: ReactNode }) {
  return <article className="grid min-h-[132px] content-between rounded-2xl border border-iq-200 bg-white p-[19px] shadow-[0_8px_28px_rgb(27_77_141_/_4%)] max-[620px]:min-h-[115px]"><span className="grid size-[35px] place-items-center rounded-[10px] bg-iq-100 text-brand">{icon}</span><div className="flex items-baseline justify-between gap-2.5"><strong className="text-[1.65rem] font-semibold tracking-[-.04em] text-iq-900">{value}</strong><small className="text-[.73rem] text-iq-500">{label}</small></div></article>
}

export function WorkspaceSection({ title, description, action, children }: { title: ReactNode; description: ReactNode; action?: ReactNode; children: ReactNode }) {
  return <section className="grid gap-3.5"><div className="flex items-center justify-between gap-[18px]"><div><h2 className="m-0 text-[1.15rem] tracking-[-.025em] text-iq-900">{title}</h2><p className="mt-1 mb-0 text-[.82rem] text-iq-500">{description}</p></div>{action && <span className="text-[.8rem] font-[650] text-brand">{action}</span>}</div>{children}</section>
}

export function FeatureGrid({ children }: { children: ReactNode }) {
  return <section className="grid grid-cols-3 gap-[13px] max-[850px]:grid-cols-1">{children}</section>
}

export function FeatureLink({ href, icon, title, body, footer }: { href: string; icon: ReactNode; title: string; body: string; footer: ReactNode }) {
  return <Link href={href} className="grid min-h-[186px] content-between rounded-[17px] border border-iq-200 bg-white p-[21px]"><span className="grid size-[38px] place-items-center rounded-[11px] bg-iq-100 text-brand">{icon}</span><div><h2 className="mt-[22px] mb-[7px] text-[1.03rem] text-iq-900">{title}</h2><p className="m-0 text-[.87rem] leading-[1.55] text-iq-600">{body}</p></div><footer className="mt-[22px] flex items-center justify-between gap-2.5 text-[.77rem] font-[650] text-brand">{footer}</footer></Link>
}

export function WorkspaceList({ children }: { children: ReactNode }) {
  return <div className="grid gap-[9px]">{children}</div>
}

export function WorkspaceListLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="flex min-h-[82px] items-center gap-[15px] rounded-[14px] border border-iq-200 bg-white px-[17px] py-[15px] hover:border-iq-300 max-[620px]:flex-wrap max-[620px]:items-start">{children}</Link>
}

export function ItemIcon({ children }: { children: ReactNode }) {
  return <span className="grid size-[38px] shrink-0 place-items-center rounded-[11px] bg-iq-100 text-brand">{children}</span>
}

export function ItemBody({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1 [&_h2]:mt-0 [&_h2]:mb-1 [&_h2]:truncate [&_h2]:text-[.94rem] [&_h2]:text-iq-900 [&_h3]:mt-0 [&_h3]:mb-1 [&_h3]:truncate [&_h3]:text-[.94rem] [&_h3]:text-iq-900 [&_p]:m-0 [&_p]:truncate [&_p]:text-[.8rem] [&_p]:text-iq-500">{children}</div>
}

export function ItemMeta({ children }: { children: ReactNode }) {
  return <div className="grid shrink-0 justify-items-end gap-1.5 text-[.72rem] text-iq-500 max-[620px]:w-full max-[620px]:grid-flow-col max-[620px]:justify-between max-[620px]:justify-items-start max-[620px]:pl-[53px]">{children}</div>
}

export function StatusBadge({ status }: { status: string }) {
  return <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-iq-100 px-[9px] py-1.5 text-[.68rem] font-[650] text-brand capitalize data-[status=completed]:bg-[#eaf8f1] data-[status=completed]:text-success data-[status=ready]:bg-[#eaf8f1] data-[status=ready]:text-success data-[status=configured]:bg-[#eaf8f1] data-[status=configured]:text-success data-[status=failed]:bg-[#fff0f2] data-[status=failed]:text-danger data-[status=planned]:bg-[#f2f4f8] data-[status=planned]:text-iq-600 data-[status=next]:bg-[#fff7e7] data-[status=next]:text-[#a4640b] data-[status=keyless]:bg-[#fff7e7] data-[status=keyless]:text-[#a4640b]" data-status={status}><i className="size-1.5 rounded-full bg-current"/>{status}</span>
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return <div className="grid justify-items-center gap-[11px] rounded-[17px] border border-dashed border-iq-300 bg-white/58 px-6 py-[46px] text-center text-iq-600"><span className="grid size-[43px] place-items-center rounded-[13px] bg-iq-100 text-brand">{icon}</span><h2 className="mt-1 mb-0 text-[1.05rem] text-iq-900">{title}</h2><p className="m-0 max-w-[440px] text-[.87rem] leading-[1.55]">{body}</p>{action && <span className="mt-[7px] text-[.82rem] font-[650] text-brand">{action}</span>}</div>
}

export function WorkspaceSplit({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(260px,.75fr)] items-start gap-[18px] max-[850px]:grid-cols-1">{children}</div>
}
