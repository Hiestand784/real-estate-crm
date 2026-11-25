import { useEffect, useState } from 'react'
import { comingUp, fetchActiveTransactions, setKeyDateDone } from '../lib/dashboard'
import type { DashboardTransaction } from '../lib/dashboard'
import { ComingUpList } from '../components/ComingUpList'
import { TransactionsTable } from '../components/TransactionsTable'

export function DashboardPage() {
    // null = still loading the first time
    const [transactions, setTransactions] = useState<DashboardTransaction[] | null>(null)
    const [loadError, setLoadError] = useState(false)
    // Bumping this number re-runs the load effect (see reload below)
    const [version, setVersion] = useState(0)
    const [recentlyDone, setRecentlyDone] = useState<Set<string>>(() => new Set())
    const [busyId, setBusyId] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        fetchActiveTransactions()
            .then((rows) => {
                if (cancelled) return
                setTransactions(rows)
                setLoadError(false)
            })
            .catch((e: { code?: string }) => {
                if (cancelled) return
                console.error('dashboard load failed', e?.code)
                setLoadError(true)
            })
        return () => {
            cancelled = true
        }
    }, [version])

    const reload = () => setVersion((v) => v + 1)

    async function handleSetDone(keyDateId: string, done: boolean) {
        setBusyId(keyDateId)
        setSaveError(null)
        const ok = await setKeyDateDone(keyDateId, done)
        setBusyId(null)

        if (!ok) {
            setSaveError('Could not save that change. Nothing was changed, so you can try again.')
            return
        }

        // A NEW Set, not .add() on the old one: React only re-renders when the
        // state value is a different object.
        setRecentlyDone((prev) => {
            const next = new Set(prev)
            if (done) next.add(keyDateId)
            else next.delete(keyDateId)
            return next
        })
        reload()
    }

    if (loadError) return <p role="alert">Could not load the dashboard. Try refreshing the page.</p>
    if (!transactions) return <p>Loading…</p>

    // Worked out on every render from the data, never stored separately
    const items = comingUp(transactions, recentlyDone)

    return (
        <section>
            <h1>Dashboard</h1>

            <h2>Coming up</h2>
            {saveError && <p role="alert">{saveError}</p>}
            <ComingUpList items={items} busyId={busyId} onSetDone={handleSetDone} />

            <h2>Current transactions</h2>
            <TransactionsTable transactions={transactions} />
        </section>
    )
}