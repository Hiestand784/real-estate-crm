import type { CalendarColor } from '../types/db'

// Calendar pip colors. Ordered dark/light so pairs that blur together for
// colorblind viewers (blue/purple, pink/gray) differ in lightness, not just hue.
// Light ones are hard to see on white alone, so the .pip class adds a border.
export const COLOR_HEX: Record<CalendarColor, string> = {
  blue: '#1E3A8A', // navy
  teal: '#5EEAD4', // light
  green: '#16A34A',
  purple: '#C4B5FD', // lavender, light so it can't be mistaken for navy
  pink: '#EC4899',
  orange: '#FDBA74', // peach, light
  brown: '#78350F',
  gray: '#374151', // charcoal
}
