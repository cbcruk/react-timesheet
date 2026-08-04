import { BareYearEnd, TimesheetDate } from './types'

const YEAR = /^(\d{4})$/
const YEAR_FIRST = /^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/
const MONTH_FIRST = /^(\d{1,2})[-/.](\d{4})$/

function toDate(year: number, month: number, hasMonth: boolean): TimesheetDate {
  return { year, month, hasMonth }
}

/**
 * Parse a timesheet date string.
 *
 * Accepts the format used by `timesheet.js` (`MM/YYYY`, `YYYY`) as well as the
 * ISO-ish ordering (`YYYY-MM`, `YYYY-MM-DD`). Days are ignored — the scale is
 * month based.
 */
export function parseDate(input: string): TimesheetDate {
  const value = String(input).trim()

  const year = YEAR.exec(value)

  if (year) {
    return toDate(Number(year[1]), 0, false)
  }

  const yearFirst = YEAR_FIRST.exec(value)

  if (yearFirst) {
    return toDate(Number(yearFirst[1]), assertMonth(yearFirst[2], value), true)
  }

  const monthFirst = MONTH_FIRST.exec(value)

  if (monthFirst) {
    return toDate(
      Number(monthFirst[2]),
      assertMonth(monthFirst[1], value),
      true
    )
  }

  throw new TypeError(
    `[react-timesheet] Unsupported date "${input}". Use "YYYY", "YYYY-MM" or "MM/YYYY".`
  )
}

function assertMonth(raw: string, input: string) {
  const month = Number(raw)

  if (month < 1 || month > 12) {
    throw new RangeError(
      `[react-timesheet] Month out of range in "${input}". Expected 1-12.`
    )
  }

  return month - 1
}

function pad(value: number) {
  return value < 10 ? `0${value}` : String(value)
}

/** Format a parsed date the way `timesheet.js` does: `MM/YYYY` or `YYYY`. */
export function formatDate(date: TimesheetDate): string {
  return date.hasMonth ? `${pad(date.month + 1)}/${date.year}` : `${date.year}`
}

/** Format a range as a single label, e.g. `01/2002-09/2002`. */
export function formatRange(
  start: TimesheetDate,
  end: TimesheetDate | null
): string {
  return end ? `${formatDate(start)}-${formatDate(end)}` : formatDate(start)
}

/** Absolute month index, used to compare dates without allocating `Date`s. */
export function toMonthIndex(date: TimesheetDate): number {
  return date.year * 12 + date.month
}

/**
 * Number of months an entry covers.
 *
 * Shared with `timesheet.js` in every case:
 *
 * - no end date: one month, or a full year when the start has no month
 * - year-only start: begins in January
 * - both ends are inclusive
 *
 * The one case where the two disagree is a year-only *end* date, which
 * `bareYearEnd` selects between. See {@link BareYearEnd}.
 */
export function getMonthSpan(
  start: TimesheetDate,
  end: TimesheetDate | null,
  bareYearEnd: BareYearEnd = 'legacy'
): number {
  if (!end) {
    return start.hasMonth ? 1 : 12
  }

  const startMonth = start.hasMonth ? start.month : 0
  const fullYears = end.year - start.year

  if (!end.hasMonth && bareYearEnd === 'legacy') {
    // Verbatim from timesheet.js, including the discontinuity at fullYears 0:
    // '04/2002'-'2002' and '04/2002'-'2003' both measure 9 months.
    return Math.max(12 - startMonth + 12 * Math.max(fullYears - 1, 0), 1)
  }

  const endMonth = end.hasMonth ? end.month : 11
  const months = endMonth + 1 + (12 - startMonth) + 12 * (fullYears - 1)

  return Math.max(months, 1)
}

/** Offset of a date from the first year of the scale, in months. */
export function getMonthOffset(date: TimesheetDate, min: number): number {
  return 12 * (date.year - min) + (date.hasMonth ? date.month : 0)
}
