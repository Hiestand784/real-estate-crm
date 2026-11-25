import { Link } from 'react-router-dom'
import { formatDate, relativeDays } from '../lib/dates'
import type { ComingUpItem } from '../lib/dashboard'
import { Pip } from './Pip'

interface ComingUpListProps {
  items: ComingUpItem[]
  busyId: string | null // the date being saved right now, if any
  onSetDone: (keyDateId: string, done: boolean) => void
}

// The words carry the meaning; the badge color only backs them up.
function badgeText(item: ComingUpItem): string {
  if (item.level === 'yellow') return 'Due soon'
  return item.days < 0 ? 'Overdue' : 'Urgent'
}

export function ComingUpList({ items, busyId, onSetDone }: ComingUpListProps) {
  if (items.length === 0) {
    return <p>Nothing needs attention right now.</p>
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Status</th>
          <th scope="col">Date</th>
          <th scope="col">Due</th>
          <th scope="col">Property</th>
          <th scope="col">Client</th>
          <th scope="col">
            <span className="visually-hidden">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const t = item.transaction
          const busy = busyId === item.keyDateId
          return (
            <tr key={item.keyDateId} className={item.done ? 'row-done' : undefined}>
              <td>
                {item.done ? (
                  'Done ✓'
                ) : (
                  <span className={`badge badge-${item.level}`}>{badgeText(item)}</span>
                )}
              </td>
              <td>{item.label}</td>
              <td>
                {formatDate(item.dueDate)} · {relativeDays(item.days)}
              </td>
              <td>
                <Pip color={t.color} />{' '}
                <Link to={`/transactions/${t.id}`}>{t.property_address}</Link>
              </td>
              <td>{t.client?.full_name ?? '—'}</td>
              <td>
                {/* aria-label says WHICH date, since every row's button reads the same */}
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`${item.done ? 'Undo' : 'Mark done'}: ${item.label}, ${t.property_address}`}
                  onClick={() => onSetDone(item.keyDateId, !item.done)}
                >
                  {busy ? 'Saving…' : item.done ? 'Undo' : 'Done'}
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
