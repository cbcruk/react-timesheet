import {
  formatRange,
  getMonthOffset,
  getMonthSpan,
  parseDate,
  toMonthIndex,
} from './date'
import {
  BareYearEnd,
  Bubble,
  NormalizedEntry,
  TimesheetEntry,
  TimesheetLayout,
} from './types'

export const DEFAULT_TYPE = 'default'

/**
 * Bring an entry into a single shape.
 *
 * Tuple arity decides the meaning of each slot, exactly as in `timesheet.js`:
 * only a four element tuple carries an end date, so `['2002', 'Label', 'lorem']`
 * is an open ended entry rather than a range.
 */
export function normalizeEntry(entry: TimesheetEntry): NormalizedEntry {
  if (Array.isArray(entry)) {
    // Tuple arity is not narrowable through the union, so read positionally.
    const [first, second, third, fourth] = entry as string[]

    if (entry.length >= 4) {
      return {
        start: first,
        end: second,
        label: third,
        type: fourth || DEFAULT_TYPE,
      }
    }

    if (entry.length === 3) {
      return {
        start: first,
        end: null,
        label: second,
        type: third || DEFAULT_TYPE,
      }
    }

    if (entry.length === 2) {
      return { start: first, end: null, label: second, type: DEFAULT_TYPE }
    }

    throw new TypeError(
      `[react-timesheet] Expected an entry with 2 to 4 items, got ${entry.length}.`
    )
  }

  return {
    start: entry.start,
    end: entry.end ?? null,
    label: entry.label,
    type: entry.type || DEFAULT_TYPE,
  }
}

export function range(min: number, max: number): number[] {
  const years: number[] = []

  for (let year = min; year <= max; year += 1) {
    years.push(year)
  }

  return years
}

export interface LayoutOptions {
  min?: number
  max?: number
  sort?: boolean
  bareYearEnd?: BareYearEnd
}

/**
 * Turn raw entries into positioned bubbles.
 *
 * `min`/`max` bound the scale, but — as in `timesheet.js` — they only ever
 * widen: an entry outside the requested range pushes the range out rather than
 * being clipped away.
 */
export function getBubbles(
  data: TimesheetEntry[],
  { min, max, sort = true, bareYearEnd = 'legacy' }: LayoutOptions = {}
): TimesheetLayout {
  const entries = data.map(normalizeEntry).map((entry) => ({
    ...entry,
    startDate: parseDate(entry.start),
    endDate: entry.end ? parseDate(entry.end) : null,
  }))

  let low = min ?? Number.POSITIVE_INFINITY
  let high = max ?? Number.NEGATIVE_INFINITY

  for (const { startDate, endDate } of entries) {
    low = Math.min(low, startDate.year)
    high = Math.max(high, (endDate ?? startDate).year)
  }

  if (!Number.isFinite(low)) {
    low = high
  }

  if (!Number.isFinite(high)) {
    high = low
  }

  if (!Number.isFinite(low)) {
    low = high = new Date().getFullYear()
  }

  if (high < low) {
    high = low
  }

  const years = range(low, high)
  const months = years.length * 12

  const ordered = sort
    ? [...entries].sort(
        (a, b) => toMonthIndex(a.startDate) - toMonthIndex(b.startDate)
      )
    : entries

  const bubbles: Bubble[] = ordered.map(
    ({ label, type, startDate, endDate }) => {
      const span = getMonthSpan(startDate, endDate, bareYearEnd)

      return {
        label,
        type,
        start: startDate,
        end: endDate,
        dateLabel: formatRange(startDate, endDate),
        months: span,
        offset: (getMonthOffset(startDate, low) / months) * 100,
        width: (span / months) * 100,
      }
    }
  )

  return { min: low, max: high, years, bubbles }
}
