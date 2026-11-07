import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { FIELDS, timeKey } from '../lib/fields'
import type { FieldDef, FormValues } from '../lib/fields'
import { FieldInput } from '../components/FieldInput'
import type { Client, Side } from '../types/db'

type ClientMode = 'existing' | 'new'
type ColumnValue = string | number | boolean | null

const EMPTY_VALUES: FormValues = {}
const EMPTY_CLIENT = { full_name: '', email: '', phone: '' }

// Turn what was typed into the right JSON type. Blank means "not answered": null.
function columnValue(field: FieldDef, raw: string): ColumnValue {
  const v = raw.trim()
  if (v === '') return null
  switch (field.type) {
    case 'integer':
    case 'money':
    case 'percent':
      return Number(v)
    case 'yesno':
      return v === 'true'
    case 'checkbox':
      // Simple items save true; items with a type save 'included' or the type
      return field.options?.length ? v : true
    default:
      return v
  }
}

export function NewTransactionPage() {
  const [side, setSide] = useState<Side | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [clientMode, setClientMode] = useState<ClientMode>('new')
  const [clientId, setClientId] = useState('')
  const [newClient, setNewClient] = useState(EMPTY_CLIENT)
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedAddress, setSavedAddress] = useState<string | null>(null)

  // Load existing clients for the dropdown
  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data } = await supabase.from('clients').select('*').order('full_name')
      if (cancelled || !data) return
      setClients(data as Client[])
      if (data.length > 0) setClientMode('existing')
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  function handleChange(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setSide(null)
    setClientId('')
    setNewClient(EMPTY_CLIENT)
    setValues(EMPTY_VALUES)
    setError(null)
    setSavedAddress(null)
  }

  function text(key: string): string {
    return (values[key] ?? '').trim()
  }

  // Fields that apply to this side AND whose "show if" condition is met
  const visibleFields: FieldDef[] = side
    ? FIELDS.filter(
      (f) =>
        f.sides.includes(side) && (!f.showIf || values[f.showIf.key] === f.showIf.equals),
    )
    : []

  // Group by section, keeping the order they appear in the list
  const sections = visibleFields.reduce<Record<string, FieldDef[]>>((acc, f) => {
    ; (acc[f.section] ??= []).push(f)
    return acc
  }, {})

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!side) return
    if (clientMode === 'existing' && !clientId) {
      setError('Choose a client.')
      return
    }
    if (clientMode === 'new' && newClient.full_name.trim() === '') {
      setError('Enter the client’s name.')
      return
    }
    const missing = visibleFields.find((f) => f.required && text(f.key) === '')
    if (missing) {
      setError(`${missing.label} is required.`)
      return
    }

    // Build the transaction object from the visible column fields only,
    // so hidden fields never leak stale values into the save.
    const transaction: Record<string, ColumnValue> = { side }
    visibleFields
      .filter((f) => f.store === 'column')
      .forEach((f) => {
        transaction[f.key] = columnValue(f, values[f.key] ?? '')
      })

    // Concession type and value go together (the database requires it too)
    const hasType = transaction.seller_concessions_type != null
    const hasValue = transaction.seller_concessions_value != null
    if (hasType !== hasValue) {
      setError('Enter both the concession type and its value, or neither.')
      return
    }

    const dateFields = visibleFields.filter((f) => f.store === 'key_date')

    // A time with no date would be silently dropped, so stop and say so
    const timeOnly = dateFields.find(
      (f) => f.type === 'datetime' && text(timeKey(f.key)) !== '' && text(f.key) === '',
    )
    if (timeOnly) {
      setError(`${timeOnly.label}: enter a date to go with the time.`)
      return
    }

    const keyDates = dateFields
      .filter((f) => text(f.key) !== '')
      .map((f) => ({
        kind: f.kind,
        due_date: text(f.key),
        // Only datetime fields have a time; blank time is saved as null
        due_time: f.type === 'datetime' ? text(timeKey(f.key)) || null : null,
      }))

    const payload = {
      client_id: clientMode === 'existing' ? clientId : null,
      new_client:
        clientMode === 'new'
          ? {
            full_name: newClient.full_name.trim(),
            email: newClient.email.trim(),
            phone: newClient.phone.trim(),
          }
          : null,
      transaction,
      key_dates: keyDates,
    }

    setSaving(true)
    const { error: rpcError } = await supabase.rpc('create_transaction', { payload })
    setSaving(false)

    if (rpcError) {
      // Log only the code: database error details can contain client data.
      console.error('create_transaction failed', rpcError.code)
      setError('Could not save. Nothing was saved, so you can try again.')
      return
    }

    setSavedAddress(text('property_address'))
  }

  if (savedAddress) {
    return (
      <section>
        <h1>Transaction saved</h1>
        <p>{savedAddress} was added.</p>
        <button onClick={reset}>Add another transaction</button>
      </section>
    )
  }

  if (!side) {
    return (
      <section>
        <h1>New transaction</h1>
        <p>Who is the client in this transaction?</p>
        <button onClick={() => setSide('buyer')}>A buyer</button>{' '}
        <button onClick={() => setSide('seller')}>A seller</button>
      </section>
    )
  }

  return (
    <section>
      <h1>New {side} transaction</h1>
      <button type="button" onClick={() => setSide(side === 'buyer' ? 'seller' : 'buyer')}>
        Switch to {side === 'buyer' ? 'seller' : 'buyer'}
      </button>

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Client</legend>

          {clients.length > 0 && (
            <div>
              <label>
                <input
                  type="radio"
                  name="clientMode"
                  checked={clientMode === 'existing'}
                  onChange={() => setClientMode('existing')}
                />
                Existing client
              </label>{' '}
              <label>
                <input
                  type="radio"
                  name="clientMode"
                  checked={clientMode === 'new'}
                  onChange={() => setClientMode('new')}
                />
                New client
              </label>
            </div>
          )}

          {clientMode === 'existing' ? (
            <div>
              <label htmlFor="client-select">Client</label>
              <select
                id="client-select"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              >
                <option value="">Choose…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="new-name">Name *</label>
                <input
                  id="new-name"
                  value={newClient.full_name}
                  onChange={(e) => setNewClient({ ...newClient, full_name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="new-email">Email</label>
                <input
                  id="new-email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="new-phone">Phone</label>
                <input
                  id="new-phone"
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                />
              </div>
            </>
          )}
        </fieldset>

        {Object.entries(sections).map(([name, fields], index) => (
          <details key={name} open={index === 0}>
            <summary>{name}</summary>
            {fields.map((f) => (
              <FieldInput key={f.key} field={f} values={values} onChange={handleChange} />
            ))}
          </details>
        ))}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save transaction'}
        </button>
        {error && <p role="alert">{error}</p>}
      </form>
    </section>
  )
}
