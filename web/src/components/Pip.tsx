import { COLOR_HEX } from '../lib/colors'
import type { CalendarColor } from '../types/db'

// The deal's calendar color as a small dot. Decorative: the address next to
// it already says which deal it is, so screen readers skip it.
export function Pip({ color }: { color: CalendarColor | null }) {
  return (
    <span
      className="pip"
      style={color ? { background: COLOR_HEX[color] } : undefined}
      aria-hidden="true"
    />
  )
}
