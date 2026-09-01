import Image from 'next/image'

export function LandingBrand({ compact = false }: { compact?: boolean }) {
  return <div className={`flex items-center gap-[9px] font-bold tracking-[-.035em] text-[#143b85] ${compact ? 'text-[.92rem] [&_img]:size-[29px]' : 'text-[1.08rem] [&_img]:size-9'}`}><Image className="rounded-[10px] object-cover" src="/insightiq-logo-padded.svg" alt="" width={42} height={42}/><span>InsightIQ</span></div>
}
