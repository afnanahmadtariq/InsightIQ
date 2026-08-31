import Image from 'next/image'
import Link from 'next/link'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import styles from './ui.module.css'

export function Brand({ href = '/' }: { href?: string }) {
  return <Link href={href} className={styles.brand} aria-label="InsightIQ home"><Image src="/insightiq-logo-padded.svg" alt="" width={36} height={36} priority/><span>InsightIQ</span></Link>
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props}/>
}

export function Field({ label, labelAction, icon, id, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; labelAction?: ReactNode; icon?: ReactNode }) {
  return <label className={styles.field} htmlFor={id}>
    <span className={styles.fieldHead}><span>{label}</span>{labelAction}</span>
    <span className={styles.inputWrap}>{icon && <span className={styles.icon}>{icon}</span>}<input id={id} className={`${styles.input} ${icon ? styles.withIcon : ''}`} {...props}/></span>
  </label>
}
