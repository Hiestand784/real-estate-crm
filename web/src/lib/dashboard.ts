import { supabase } from './supabase'
import { FIELDS } from './fields'
import { daysUntil, todayString, warningLevel } from './dates'
import type { WarningLevel } from './dates'
import type { Client, KeyDate, KeyDateKind, Transaction } from '../types/db'

// Only the columns the dashboard asks for. Pick<> reuses the real types,
// so a renamed column shows up as an error here too.
export type DashboardKeyDate = Pick<KeyDate, 'id' | 'kind' | 'due_date' | 'completed_at'>

export type DashboardTransaction = Pick<
    Transaction,
    'id' | 'property_address' | 'side' | 'color'
> & {
    client: Pick<Client, 'full_name'> | null
    key_dates: DashboardKeyDate[]
}

// One request: active transactions with their client and key dates nested in.
// Supabase follows the foreign keys; row-level security still applies to
// every table in the query.
export async function fetchActiveTransactions(): Promise<DashboardTransaction[]> {
    const { data, error } = await supabase
        .from('transactions')
        .select(
            'id, property_address, side, color, client:clients(full_name), key_dates(id, kind, due_date, completed_at)',
        )
        .eq('status', 'active')
        .order('property_address')

    if (error) throw error
    // The app has no generated database types yet, so this cast is our promise
    // about the shape. It must match the select string above.
    return (data ?? []) as unknown as DashboardTransaction[]
}

// Mark a key date done (now) or not done (null). Returns false if it failed.
// .select('id') asks for the changed row back: if row-level security hid the
// row, Postgres updates 0 rows WITHOUT an error, and this is how we notice.
export async function setKeyDateDone(id: string, done: boolean): Promise<boolean> {
    const { data, error } = await supabase
        .from('key_dates')
        .update({ completed_at: done ? new Date().toISOString() : null })
        .eq('id', id)
        .select('id')

    if (error) {
        // Only the code: error details can contain client data.
        console.error('setKeyDateDone failed', error.code)
        return false
    }
    return data?.length === 1
}

// The form's label for a date kind, so "Initial inspection due" lives in one place.
export function keyDateLabel(kind: KeyDateKind): string {
    return FIELDS.find((f) => f.store === 'key_date' && f.kind === kind)?.label ?? kind
}

export interface ComingUpItem {
    keyDateId: string
    label: string
    dueDate: string
    days: number
    level: WarningLevel
    done: boolean // checked off during this visit; shown with Undo
    transaction: DashboardTransaction
}

// Every key date that has a warning right now, soonest first.
// recentlyDone: ids checked off on this visit. They're judged as if still
// open so they keep their row (and Undo button) until she leaves the page.
export function comingUp(
    transactions: DashboardTransaction[],
    recentlyDone: Set<string>,
    today: string = todayString(),
): ComingUpItem[] {
    return transactions
        .flatMap((t) =>
            t.key_dates.flatMap((d) => {
                const done = recentlyDone.has(d.id)
                const level = warningLevel(d.kind, d.due_date, done ? null : d.completed_at, today)
                if (!level) return []
                return [
                    {
                        keyDateId: d.id,
                        label: keyDateLabel(d.kind),
                        dueDate: d.due_date,
                        days: daysUntil(d.due_date, today),
                        level,
                        done,
                        transaction: t,
                    },
                ]
            }),
        )
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function closingDate(t: DashboardTransaction): string | null {
    return t.key_dates.find((d) => d.kind === 'closing')?.due_date ?? null
}