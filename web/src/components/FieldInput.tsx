import type { FieldDef, FormValues, Option } from '../lib/fields'

interface FieldInputProps {
  field: FieldDef
  values: FormValues
  onChange: (key: string, value: string) => void
}

const YESNO_OPTIONS: Option[] = [
  { value: '', label: '—' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

// Draws one form control based on the field's type.
// The form page never needs to know how each type looks.
export function FieldInput({ field, values, onChange }: FieldInputProps) {
  const id = `field-${field.key}`
  const value = values[field.key] ?? ''
  const set = (v: string) => onChange(field.key, v)

  let control
  switch (field.type) {
    case 'computed':
      control = <output id={id}>{field.compute ? field.compute(values) : '—'}</output>
      break

    case 'textarea':
      control = (
        <textarea id={id} name={field.key} rows={4} value={value} onChange={(e) => set(e.target.value)} />
      )
      break

    case 'select':
    case 'yesno': {
      const options = field.type === 'yesno' ? YESNO_OPTIONS : (field.options ?? [])
      control = (
        <select id={id} name={field.key} value={value} onChange={(e) => set(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )
      break
    }

    case 'integer':
      control = (
        <input
          id={id}
          name={field.key}
          type="number"
          step="1"
          min="0"
          inputMode="numeric"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )
      break

    case 'money':
      control = (
        <input
          id={id}
          name={field.key}
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )
      break

    case 'percent':
      control = (
        <input
          id={id}
          name={field.key}
          type="number"
          step="0.001"
          min="0"
          max="100"
          inputMode="decimal"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )
      break

    case 'date':
      control = (
        <input id={id} name={field.key} type="date" value={value} onChange={(e) => set(e.target.value)} />
      )
      break

    default:
      control = (
        <input
          id={id}
          name={field.key}
          type="text"
          required={field.required}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )
  }

  return (
    <div>
      <label htmlFor={id}>
        {field.label}
        {field.required ? ' *' : ''}
      </label>
      {control}
      {field.help && <small>{field.help}</small>}
    </div>
  )
}
