import type { FieldDef, FormValues, Option } from '../lib/fields'
import { timeKey } from '../lib/fields'

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

  // Sub-heading inside a section, e.g. "Lender" or "Items included"
  if (field.type === 'heading') {
    return <h3>{field.label}</h3>
  }

  // Checkbox: '' = unchecked (saved as null). Simple items store 'true'.
  // Items with options store 'included' until a type is picked, then the type.
  if (field.type === 'checkbox') {
    const checked = value !== ''
    const options = field.options ?? []
    return (
      <div>
        <label>
          <input
            id={id}
            name={field.key}
            type="checkbox"
            checked={checked}
            onChange={(e) => set(e.target.checked ? (options.length ? 'included' : 'true') : '')}
          />
          {field.label}
        </label>
        {checked && options.length > 0 && (
          <span>
            {options.map((o) => (
              <label key={o.value}>
                {' '}
                <input
                  type="radio"
                  name={`${field.key}-type`}
                  checked={value === o.value}
                  onChange={() => set(o.value)}
                />
                {o.label}
              </label>
            ))}
          </span>
        )}
      </div>
    )
  }

  // When the label is hidden, screen readers still get it through aria-label
  const ariaLabel = field.hideLabel ? field.label : undefined

  let control
  switch (field.type) {
    case 'computed':
      control = <output id={id}>{field.compute ? field.compute(values) : '—'}</output>
      break

    case 'textarea':
      control = (
        <textarea
          id={id}
          name={field.key}
          rows={4}
          aria-label={ariaLabel}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )
      break

    case 'email':
    case 'tel':
      control = (
        <input
          id={id}
          name={field.key}
          type={field.type}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
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

    // Two inputs so the time can stay blank. The time lives under its own key.
    case 'datetime': {
      const tKey = timeKey(field.key)
      control = (
        <>
          <input id={id} name={field.key} type="date" value={value} onChange={(e) => set(e.target.value)} />{' '}
          <input
            name={tKey}
            type="time"
            aria-label={`${field.label} (time)`}
            value={values[tKey] ?? ''}
            onChange={(e) => onChange(tKey, e.target.value)}
          />
        </>
      )
      break
    }

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
      {!field.hideLabel && (
        <label htmlFor={id}>
          {field.label}
          {field.required ? ' *' : ''}
        </label>
      )}
      {control}
      {field.help && <small>{field.help}</small>}
    </div>
  )
}
