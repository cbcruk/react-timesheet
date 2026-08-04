import { describe, expect, it } from 'vitest'
import {
  formatDate,
  formatRange,
  getMonthOffset,
  getMonthSpan,
  parseDate,
  toMonthIndex,
} from '../src/Timesheet/date'

describe('parseDate', () => {
  it('parses a year-only date without a month', () => {
    expect(parseDate('2002')).toEqual({
      year: 2002,
      month: 0,
      hasMonth: false,
    })
  })

  it('parses the ISO-ish year-first format', () => {
    expect(parseDate('2002-09')).toEqual({
      year: 2002,
      month: 8,
      hasMonth: true,
    })
  })

  it('parses the month-first format used by timesheet.js', () => {
    expect(parseDate('09/2002')).toEqual({
      year: 2002,
      month: 8,
      hasMonth: true,
    })
  })

  it('accepts a single digit month', () => {
    expect(parseDate('1/2002')).toEqual({
      year: 2002,
      month: 0,
      hasMonth: true,
    })
    expect(parseDate('2002-1')).toEqual({
      year: 2002,
      month: 0,
      hasMonth: true,
    })
  })

  it('ignores the day part of a full ISO date', () => {
    expect(parseDate('2002-09-17')).toEqual({
      year: 2002,
      month: 8,
      hasMonth: true,
    })
  })

  it('trims surrounding whitespace', () => {
    expect(parseDate('  2002-09  ').month).toBe(8)
  })

  it('rejects unsupported input', () => {
    expect(() => parseDate('september 2002')).toThrow(TypeError)
    expect(() => parseDate('')).toThrow(TypeError)
  })

  it('rejects an out of range month', () => {
    expect(() => parseDate('2002-13')).toThrow(RangeError)
    expect(() => parseDate('0/2002')).toThrow(RangeError)
  })
})

describe('formatDate', () => {
  it('pads the month and puts it first', () => {
    expect(formatDate(parseDate('2002-09'))).toBe('09/2002')
    expect(formatDate(parseDate('2002-11'))).toBe('11/2002')
  })

  it('omits the month for year-only dates', () => {
    expect(formatDate(parseDate('2002'))).toBe('2002')
  })
})

describe('formatRange', () => {
  it('joins both ends with a dash', () => {
    expect(formatRange(parseDate('2002-01'), parseDate('2003-09'))).toBe(
      '01/2002-09/2003'
    )
  })

  it('renders only the start when there is no end', () => {
    expect(formatRange(parseDate('2002-01'), null)).toBe('01/2002')
  })
})

describe('getMonthSpan', () => {
  it('counts both ends inclusively', () => {
    expect(getMonthSpan(parseDate('2002-01'), parseDate('2002-09'))).toBe(9)
    expect(getMonthSpan(parseDate('2002-01'), parseDate('2002-01'))).toBe(1)
  })

  it('spans across years', () => {
    expect(getMonthSpan(parseDate('2002-06'), parseDate('2003-09'))).toBe(16)
    expect(getMonthSpan(parseDate('2003-01'), parseDate('2003-12'))).toBe(12)
  })

  it('treats a year-only start as starting in January', () => {
    expect(getMonthSpan(parseDate('2002'), parseDate('2002-06'))).toBe(6)
  })

  it('stops a year-only end at the start of that year, as timesheet.js does', () => {
    expect(getMonthSpan(parseDate('2002-01'), parseDate('2004'))).toBe(24)
    expect(getMonthSpan(parseDate('2002-04'), parseDate('2003'))).toBe(9)
  })

  it('still runs a same-year year-only end through December', () => {
    // Upstream's discontinuity: within one year the end year is inclusive.
    expect(getMonthSpan(parseDate('2002-07'), parseDate('2002'))).toBe(6)
  })

  it('runs a year-only end through December in december mode', () => {
    expect(
      getMonthSpan(parseDate('2002-01'), parseDate('2004'), 'december')
    ).toBe(36)
    expect(
      getMonthSpan(parseDate('2002-04'), parseDate('2003'), 'december')
    ).toBe(21)
    expect(
      getMonthSpan(parseDate('2002-07'), parseDate('2002'), 'december')
    ).toBe(6)
  })

  it('spans a single month when there is no end date', () => {
    expect(getMonthSpan(parseDate('2002-04'), null)).toBe(1)
  })

  it('spans a full year when a year-only date has no end', () => {
    expect(getMonthSpan(parseDate('2002'), null)).toBe(12)
  })

  it('never returns less than one month for inverted ranges', () => {
    expect(getMonthSpan(parseDate('2003-01'), parseDate('2002-01'))).toBe(1)
  })
})

describe('getMonthOffset', () => {
  it('counts months from the first year of the scale', () => {
    expect(getMonthOffset(parseDate('2002-01'), 2002)).toBe(0)
    expect(getMonthOffset(parseDate('2002-09'), 2002)).toBe(8)
    expect(getMonthOffset(parseDate('2004-03'), 2002)).toBe(26)
  })

  it('treats a year-only date as January', () => {
    expect(getMonthOffset(parseDate('2004'), 2002)).toBe(24)
  })
})

describe('toMonthIndex', () => {
  it('orders dates chronologically', () => {
    expect(toMonthIndex(parseDate('2002-01'))).toBeLessThan(
      toMonthIndex(parseDate('2002-02'))
    )
    expect(toMonthIndex(parseDate('2002-12'))).toBeLessThan(
      toMonthIndex(parseDate('2003-01'))
    )
  })
})
