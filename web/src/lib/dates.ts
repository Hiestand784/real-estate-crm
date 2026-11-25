import type { KeyDateKind } from '../types/db'

// Days before the due date when a warning starts. Due day = 0.
// Example: inspection { yellow: 6, red: 1 } means
//   6..2 days out -> yellow, 1 day out or the due day itself -> red.
export interface WarningRule {
  yellow: number
  red: number
}

export type WarningLevel = 'yellow' | 'red'

// Only these kinds get warnings for now. Anything not listed gets none.
export const WARNINGS: Partial<Record<KeyDateKind, WarningRule>> = {
  inspection_deadline: { yellow: 6, red: 1 },
  hoa_due: { yellow: 6, red: 1 },
  closing: { yellow: 6, red: 1 },
  emd_deadline: { yellow: 2, red: 0 },
  listing_contract_expires: { yellow: 13, red: 6 },
  buyer_agency_end: { yellow: 13, red: 6 },
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

// Today on HER clock, as 'YYYY-MM-DD' (the same format Postgres sends a date in).
// Don't use new Date().toISOString().slice(0, 10): that's the UTC date, which
// in Indiana flips to tomorrow at 7 or 8 pm.
export function todayString(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 'YYYY-MM-DD' -> a day number. Treating both dates as UTC midnight means
// every day is exactly 24 hours long, so daylight saving can't make a
// difference come out as 6.958 days.
function dayNumber(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / MS_PER_DAY
}

// Whole days from today until the due date. 0 = due today, negative = overdue.
export function daysUntil(dueDate: string, today: string = todayString()): number {
  return dayNumber(dueDate) - dayNumber(today)
}

// The warning for one key date, or null for none.
// A checked-off date never warns. An unchecked overdue date stays red.
export function warningLevel(
  kind: KeyDateKind,
  dueDate: string,
  completedAt: string | null,
  today: string = todayString(),
): WarningLevel | null {
  if (completedAt) return null
  const rule = WARNINGS[kind]
  if (!rule) return null

  const days = daysUntil(dueDate, today)
  if (days <= rule.red) return 'red' // includes overdue (negative days)
  if (days <= rule.yellow) return 'yellow'
  return null
}

// '2026-11-20' -> 'Fri, Nov 20'. Building the Date from numbers uses local
// time, which is safe; only parsing a date STRING is the UTC trap.
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

// 0 -> 'Today', 1 -> 'Tomorrow', 5 -> 'In 5 days', -2 -> '2 days overdue'
export function relativeDays(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days === -1) return '1 day overdue'
  if (days < 0) return `${-days} days overdue`
  return `In ${days} days`
}
