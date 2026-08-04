import type { CSSProperties } from 'react'

/**
 * A parsed timesheet date.
 *
 * `timesheet.js` only ever cares about year/month precision, and it treats a
 * year-only date ("2002") differently from a year-month date ("2002-01"): the
 * former spans the whole year, the latter a single month. `hasMonth` carries
 * that distinction.
 */
export interface TimesheetDate {
  /** Full year, e.g. `2002`. */
  year: number
  /** Zero based month, e.g. `0` for January. `0` when `hasMonth` is false. */
  month: number
  /** Whether the source string carried a month. */
  hasMonth: boolean
}

/**
 * A single entry, in the tuple form used by `timesheet.js`.
 *
 * - `[start, end, label, type]` — a range with an explicit category
 * - `[start, label, type]` — an open ended entry with a category
 * - `[start, label]` — an open ended entry using the `default` category
 */
export type TimesheetTuple =
  | [start: string, end: string, label: string, type: string]
  | [start: string, label: string, type: string]
  | [start: string, label: string]

/** A single entry, in object form. */
export interface TimesheetObject {
  start: string
  end?: string | null
  label: string
  type?: string
}

export type TimesheetEntry = TimesheetTuple | TimesheetObject

/** An entry after normalization, before any date parsing. */
export interface NormalizedEntry {
  start: string
  end: string | null
  label: string
  type: string
}

/** An entry laid out against the timesheet's year scale. */
export interface Bubble {
  label: string
  type: string
  start: TimesheetDate
  end: TimesheetDate | null
  /** Human readable range, e.g. `01/2002-09/2002`. */
  dateLabel: string
  /** Length of the entry in months, always at least `1`. */
  months: number
  /** Distance from the left edge of the scale, in percent. */
  offset: number
  /** Width of the bubble, in percent. */
  width: number
}

export interface TimesheetLayout {
  min: number
  max: number
  years: number[]
  bubbles: Bubble[]
}

/**
 * How to read a year-only end date such as `['2002-01', '2004', 'Label', '']`.
 *
 * This is the only place where the two readings differ; everything else about
 * the layout matches `timesheet.js` exactly.
 *
 * - `'legacy'` (default) — reproduces `timesheet.js`, as asserted by its own
 *   test suite: the entry stops at the start of the end year (24 months). Note
 *   that upstream is discontinuous here — `['04/2002', '2002']` and
 *   `['04/2002', '2003']` both measure 9 months, so the end year is inclusive
 *   within a single year and exclusive across years.
 * - `'december'` — the end year is inclusive, so the entry runs through
 *   December 2004 (36 months). A bare year then means the same thing wherever
 *   it appears: the whole of that year.
 */
export type BareYearEnd = 'legacy' | 'december'

export type ColorScheme = 'default' | 'alternative'

export type Theme = 'dark' | 'light'

export interface Props {
  /** Entries to render, in tuple or object form. */
  data: TimesheetEntry[]
  /** First year of the scale. Widened automatically to fit `data`. */
  min?: number
  /** Last year of the scale. Widened automatically to fit `data`. */
  max?: number
  /** Built-in palette to use. Defaults to `default`. */
  colorScheme?: ColorScheme
  /** Background/text palette. Defaults to `dark`. */
  theme?: Theme
  /** Per-type color overrides, e.g. `{ lorem: '#09f' }`. */
  colors?: Record<string, string>
  /** Sort entries by start date. Defaults to `true`. */
  sort?: boolean
  /** How to read a year-only end date. Defaults to `'legacy'`. */
  bareYearEnd?: BareYearEnd
  /** Render the date range next to each label. Defaults to `true`. */
  showDates?: boolean
  /** Called when an entry is clicked or activated with the keyboard. */
  onBubbleClick?: (bubble: Bubble, index: number) => void
  className?: string
  style?: CSSProperties
}
