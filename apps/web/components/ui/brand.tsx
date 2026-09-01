import Image from 'next/image'
import Link from 'next/link'

export function Brand({ href = '/' }: { href?: string }) {
  return <Link href={href} className="inline-flex w-fit items-center gap-[9px] font-[750] tracking-[-.04em] text-inherit [&_img]:size-9 [&_img]:rounded-[10px] [&_img]:object-cover [&_span]:text-[1.2rem]" aria-label="InsightIQ home"><Image src="/insightiq-logo-padded.svg" alt="" width={36} height={36} priority/><span>InsightIQ</span></Link>
}
