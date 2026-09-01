import type { IconType } from 'react-icons'

export type LandingFeature = {
  number: string
  icon: IconType
  title: string
  body: string
}

export function FeatureCard({ feature, delay = '' }: { feature: LandingFeature; delay?: string }) {
  const Icon = feature.icon
  return <article className={`relative rounded-[18px] border border-[#dce9f6] bg-white p-[30px] transition-[transform,border-color,box-shadow] duration-300 ease-fluid hover:-translate-y-1 hover:border-[#bdddf4] hover:shadow-card-hover motion-reduce:transition-none ${delay}`} data-reveal>
    <span className="absolute top-[25px] right-[27px] text-[.68rem] font-semibold text-[#9eb6cf]">{feature.number}</span>
    <div className="grid size-[46px] place-items-center rounded-[14px] bg-[linear-gradient(145deg,#e7f7ff,#edf2fd)] text-[1.2rem] text-[#1689da]"><Icon/></div>
    <h3 className="mt-7 mb-2.5 text-[1.15rem] text-[#244a78]">{feature.title}</h3>
    <p className="m-0 max-w-[470px] text-[.98rem] leading-[1.6] text-[#7489a7]">{feature.body}</p>
  </article>
}
