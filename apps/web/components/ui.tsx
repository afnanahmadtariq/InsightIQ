import Image from 'next/image'
import Link from 'next/link'
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function Brand({ href = '/' }: { href?: string }) {
  return <Link href={href} className="inline-flex w-fit items-center gap-[9px] font-[750] tracking-[-.04em] text-inherit [&_img]:size-9 [&_img]:rounded-[10px] [&_img]:object-cover [&_span]:text-[1.2rem]" aria-label="InsightIQ home"><Image src="/insightiq-logo-padded.svg" alt="" width={36} height={36} priority/><span>InsightIQ</span></Link>
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const variantClass = variant === 'primary'
    ? 'bg-[linear-gradient(135deg,#1c9eec,#16429b)] text-white! hover:not-disabled:brightness-95'
    : 'border-iq-200! bg-white text-iq-900 hover:border-iq-300! hover:bg-iq-50'
  return <button className={`inline-flex min-h-12 items-center justify-center gap-[9px] rounded-xl border border-transparent px-[19px] font-[650] transition-[background,border-color,filter] duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand/20 disabled:cursor-not-allowed disabled:opacity-55 ${variantClass} ${className}`} {...props}/>
}

export function Field({ label, labelAction, icon, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; labelAction?: ReactNode; icon?: ReactNode }) {
  return <label className="grid gap-[7px]" htmlFor={id}>
    <span className="flex items-baseline justify-between gap-3 text-[.86rem] font-[650] text-iq-700 [&_a]:text-brand"><span>{label}</span>{labelAction}</span>
    <span className="relative">{icon && <span className="pointer-events-none absolute top-1/2 left-[13px] -translate-y-1/2 text-iq-500">{icon}</span>}<input id={id} className={`min-h-[47px] w-full rounded-xl border border-iq-300 bg-white px-3.5 text-[.95rem] text-iq-950 transition-[border-color,box-shadow] duration-150 placeholder:text-[#97aac3] focus:border-brand-bright focus:outline-0 focus:ring-3 focus:ring-brand-bright/10 ${icon ? 'pl-[41px]' : ''}`} {...props}/></span>
  </label>
}

export function FormMessage({ tone = 'notice', className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { tone?: 'notice' | 'error' | 'success' }) {
  const toneClass = tone === 'error'
    ? 'border border-danger/20 bg-[#fff0f2] text-danger'
    : tone === 'success'
      ? 'bg-[#eef9f3] text-success'
      : 'bg-iq-100 text-iq-700'
  return <p className={`m-0 rounded-[10px] px-[13px] py-[11px] text-[.87rem] leading-normal ${toneClass} ${className}`} {...props}/>
}
