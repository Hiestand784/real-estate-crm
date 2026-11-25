import { Link } from 'react-router-dom'
import { closingDate } from '../lib/dashboard'
import type { DashboardTransaction } from '../lib/dashboard'
import { formatDate } from '../lib/dates'
import { Pip } from './Pip'

export function TransactionsTable({ transactions }: { transactions: DashboardTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <p>
        No active transactions. <Link to="/transactions/new">Add one</Link>
      </p>
    )
  }

  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Property</th>
          <th scope="col">Client</th>
          <th scope="col">Side</th>
          <th scope="col">Closing</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => {
          const closing = closingDate(t)
          return (
            <tr key={t.id}>
              <td>
                <Pip color={t.color} />{' '}
                <Link to={`/transactions/${t.id}`}>{t.property_address}</Link>
              </td>
              <td>{t.client?.full_name ?? '—'}</td>
              <td>{t.side === 'buyer' ? 'Buyer' : 'Seller'}</td>
              <td>{closing ? formatDate(closing) : '—'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
