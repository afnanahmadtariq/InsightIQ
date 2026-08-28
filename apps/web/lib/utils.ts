export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

export function formatCurrency(amountUsd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amountUsd)
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export function formatRelativeTime(isoDate: string): string {
  const deltaMs = new Date(isoDate).getTime() - Date.now()
  const deltaMinutes = Math.round(deltaMs / 60000)
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const absMinutes = Math.abs(deltaMinutes)
  if (absMinutes < 60) return formatter.format(deltaMinutes, 'minute')

  const deltaHours = Math.round(deltaMinutes / 60)
  if (Math.abs(deltaHours) < 24) return formatter.format(deltaHours, 'hour')

  const deltaDays = Math.round(deltaHours / 24)
  return formatter.format(deltaDays, 'day')
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(isoDate),
  )
}

export function initialsFromName(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}
