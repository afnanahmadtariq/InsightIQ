import { FileCheck2, Search, Sparkles, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { Brand } from './ui'

export function AuthShell({ children, mode }: { children: ReactNode; mode: 'sign-in' | 'sign-up' }) {
  return <main className="grid min-h-screen grid-cols-[minmax(380px,.9fr)_minmax(500px,1.1fr)] bg-white max-[900px]:grid-cols-1">
    <section className="relative flex flex-col overflow-hidden bg-iq-950 px-[52px] pt-[38px] pb-11 text-white after:pointer-events-none after:absolute after:inset-0 after:opacity-12 after:[background-image:linear-gradient(rgb(255_255_255_/_12%)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_12%)_1px,transparent_1px)] after:[background-size:46px_46px] after:[mask-image:linear-gradient(to_bottom_right,black,transparent_76%)] [&>*]:relative [&>*]:z-1 [&>small]:text-[#8fa7c6] max-[900px]:min-h-80 max-[900px]:px-[34px] max-[900px]:pt-7 max-[900px]:pb-7 max-[900px]:[&>small]:hidden max-[560px]:min-h-[235px] max-[560px]:px-5 max-[560px]:py-[22px]">
      <Brand/>
      <div className="my-auto py-[70px] max-[900px]:pt-[50px] max-[900px]:pb-[25px] max-[560px]:pt-8 max-[560px]:pb-2.5 [&>h1]:my-[18px] [&>h1]:max-w-[600px] [&>h1]:text-[clamp(2.5rem,5vw,4.6rem)] [&>h1]:leading-[.98] [&>h1]:font-light [&>h1]:tracking-[-.06em] max-[900px]:[&>h1]:text-[2.8rem] max-[560px]:[&>h1]:text-[2.1rem] [&>p:not(:first-child)]:max-w-[520px] [&>p:not(:first-child)]:text-base [&>p:not(:first-child)]:leading-[1.7] [&>p:not(:first-child)]:text-[#b9cbe3] max-[900px]:[&>p:not(:first-child)]:hidden">
        <p className="text-[.74rem] font-[650] tracking-[.13em] text-sky uppercase">Evidence-first sales intelligence</p>
        <h1>{mode === 'sign-up' ? 'Know the person. Understand the moment.' : 'Your deal intelligence is ready when you are.'}</h1>
        <p>Research prospects, connect their current signals to your offer, and prepare outreach that can be verified.</p>
        <div className="mt-[38px] grid grid-cols-4 gap-2 max-[560px]:hidden [&>span]:grid [&>span]:gap-2.5 [&>span]:rounded-[11px] [&>span]:border [&>span]:border-white/15 [&>span]:bg-white/4 [&>span]:px-2.5 [&>span]:py-[13px] [&>span]:text-[.74rem] [&>span]:font-[650] [&>span]:tracking-[.04em] [&>span]:text-[#b8cbe3] [&>span]:uppercase [&_svg]:text-sky"><span><Target size={18}/>Identify</span><span><Search size={18}/>Research</span><span><FileCheck2 size={18}/>Verify</span><span><Sparkles size={18}/>Act</span></div>
      </div>
      <small>InsightIQ · Evidence behind every claim</small>
    </section>
    <section className="grid place-items-center bg-white bg-[radial-gradient(circle_at_90%_8%,rgb(73_188_247_/_10%),transparent_24%)] px-[30px] py-12 max-[900px]:px-[25px] max-[900px]:py-[55px] max-[560px]:place-items-start_center max-[560px]:px-5 max-[560px]:pt-10 max-[560px]:pb-[60px]"><div className="w-full max-w-[430px] [&>h2]:m-0 [&>h2]:text-[2rem] [&>h2]:font-medium [&>h2]:tracking-[-.045em] [&>h2]:text-iq-900 [&>p]:mt-2 [&>p]:mb-7 [&>p]:leading-[1.55] [&>p]:text-iq-600 [&>p_a]:font-[650] [&>p_a]:text-brand">{children}</div></section>
  </main>
}
