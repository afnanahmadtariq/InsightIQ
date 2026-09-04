'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Button } from './button'

export function CopyButton({ value, label = 'Copy' }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return <Button type="button" variant="secondary" size="xs" onClick={copy} aria-live="polite">
    {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : label}
  </Button>
}
