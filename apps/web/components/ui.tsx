import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-400', className)}>
      {children}
    </p>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-white/10 bg-white/[0.04] backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline'
  href?: string
}

export function Button({ variant = 'primary', className, children, href, ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60'
  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-[0_14px_30px_rgba(23,143,231,0.35)] hover:shadow-[0_18px_40px_rgba(23,143,231,0.5)] hover:-translate-y-0.5',
    outline: 'border border-white/20 text-white hover:border-brand-400/70 hover:bg-white/5',
    ghost: 'text-mist-100/80 hover:text-white hover:bg-white/5',
  }
  const classes = cn(base, variants[variant], className)

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

const CONFIDENCE_STYLES: Record<string, string> = {
  High: 'bg-success-500/15 text-success-500 border-success-500/30',
  Medium: 'bg-warning-500/15 text-warning-500 border-warning-500/30',
  Low: 'bg-danger-500/15 text-danger-500 border-danger-500/30',
}

export function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  return (
    <span className={cn('rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide', CONFIDENCE_STYLES[level])}>
      {level} confidence
    </span>
  )
}

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'bg-success-500/15 text-success-500 border-success-500/30' },
  in_progress: { label: 'Researching…', className: 'bg-brand-400/15 text-brand-300 border-brand-400/30' },
  queued: { label: 'Queued', className: 'bg-white/10 text-mist-100/70 border-white/15' },
  needs_review: { label: 'Needs review', className: 'bg-warning-500/15 text-warning-500 border-warning-500/30' },
}

export function StatusBadge({ status }: { status: keyof typeof STATUS_STYLES }) {
  const style = STATUS_STYLES[status]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold', style.className)}>
      {status === 'in_progress' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {style.label}
    </span>
  )
}

export function CitationChip({ index, label }: { index: number; label: string }) {
  return (
    <span
      title={label}
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-400/40 bg-brand-400/10 text-[0.62rem] font-bold text-brand-300"
    >
      {index}
    </span>
  )
}
