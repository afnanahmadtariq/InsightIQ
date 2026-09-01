import Image from 'next/image'
import Link from 'next/link'

export function Brand({ href = '/', compact = false }: { href?: string; compact?: boolean }) {
  return <Link href={href} className="inline-flex w-fit items-center gap-2.5 text-xl font-bold tracking-[-.04em] text-inherit" aria-label="InsightIQ home"><Image className="size-9 rounded-[10px] object-cover" src="/insightiq-logo-padded.svg" alt="" width={36} height={36} priority/>{!compact && <span>InsightIQ</span>}</Link>
}
