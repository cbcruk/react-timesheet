// @vitest-environment node
//
// Runs the vendored upstream implementation (test/fixtures/timesheet.js) and
// this port against the same inputs. The upstream constructor only touches the
// DOM when `document` exists, so this file deliberately runs in the node
// environment: `new Timesheet()` then just parses.
//
// Passing `widthMonth = 12` makes upstream's pixel maths return plain month
// counts — `getWidth()` is months and `getStartOffset()` is the month offset.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { formatRange, getMonthSpan, parseDate } from '../src/Timesheet/date'
import { getBubbles } from '../src/Timesheet/helper'
import type { BareYearEnd } from '../src/Timesheet/types'

interface UpstreamDate {
  getFullYear(): number
  hasMonth: boolean
}

interface UpstreamBubble {
  getMonths(): number
  getStartOffset(): number
  getWidth(): number
  getDateLabel(): string
}

interface Upstream {
  year: { min: number; max: number }
  data: {
    start: UpstreamDate
    end: UpstreamDate | null
    label: string
    type: string
  }[]
  parseDate(value: string): UpstreamDate
  createBubble(
    widthMonth: number,
    min: number,
    start: UpstreamDate,
    end: UpstreamDate | null
  ): UpstreamBubble
}

interface UpstreamConstructor {
  new (
    container?: unknown,
    min?: number,
    max?: number,
    data?: unknown[]
  ): Upstream
}

let Timesheet: UpstreamConstructor
let upstream: Upstream

beforeAll(() => {
  const source = readFileSync(
    fileURLToPath(new URL('./fixtures/timesheet.js', import.meta.url)),
    'utf8'
  )
  const scope = { window: {} as { Timesheet?: UpstreamConstructor } }

  new Function('window', source)(scope.window)

  Timesheet = scope.window.Timesheet as UpstreamConstructor
  upstream = new Timesheet()
})

function upstreamMonths(start: string, end: string | null) {
  return upstream
    .createBubble(
      12,
      2000,
      upstream.parseDate(start),
      end ? upstream.parseDate(end) : null
    )
    .getMonths()
}

function portMonths(start: string, end: string | null, mode?: BareYearEnd) {
  return getMonthSpan(parseDate(start), end ? parseDate(end) : null, mode)
}

describe('upstream fixture', () => {
  it('loads and exposes the Timesheet constructor', () => {
    expect(typeof Timesheet).toBe('function')
  })

  // Copied from upstream's own test/timesheet.js. If these ever stop holding,
  // the vendored fixture drifted from the version this port was checked against.
  it.each([
    ['2002', '2002', 12],
    ['2002', '2003', 12],
    ['2002', '2004', 24],
    ['04/2002', '2002', 9],
    ['04/2002', '2003', 9],
    ['04/2002', '2004', 21],
    ['04/2002', '04/2003', 13],
    ['04/2002', '04/2004', 25],
    ['04/2002', null, 1],
    ['2002', null, 12],
  ] as const)('measures %s to %s as %i months', (start, end, expected) => {
    expect(upstreamMonths(start, end)).toBe(expected)
  })
})

describe('parity with timesheet.js', () => {
  const STARTS = ['2002', '01/2002', '04/2002', '09/2002', '12/2002']
  const ENDS = [
    null,
    '2002',
    '2003',
    '2005',
    '01/2003',
    '04/2003',
    '12/2003',
    '12/2005',
  ]

  it.each(STARTS.flatMap((start) => ENDS.map((end) => [start, end] as const)))(
    'matches month spans for %s to %s',
    (start, end) => {
      expect(portMonths(start, end)).toBe(upstreamMonths(start, end))
    }
  )

  it.each([
    ['04/2002', '09/2003'],
    ['2002', '2003'],
    ['04/2002', '2003'],
    ['2002', '09/2003'],
    ['04/2002', null],
    ['2002', null],
    ['12/2002', '01/2003'],
  ] as const)('matches the date label for %s to %s', (start, end) => {
    const expected = upstream
      .createBubble(
        12,
        2000,
        upstream.parseDate(start),
        end ? upstream.parseDate(end) : null
      )
      .getDateLabel()

    expect(formatRange(parseDate(start), end ? parseDate(end) : null)).toBe(
      expected
    )
  })

  it('matches start offsets, entry arity, types and scale widening', () => {
    const data = [
      ['04/2002', '09/2002', 'range', 'lorem'],
      ['06/2003', 'open with type', 'ipsum'],
      ['01/2004', 'open no type'],
      ['1999', '2001', 'before min', 'dolor'],
      ['03/2020', '06/2020', 'after max', 'sit'],
    ]

    const expected = new Timesheet(null, 2002, 2005, data)
    const actual = getBubbles(data as never, {
      min: 2002,
      max: 2005,
      sort: false,
    })

    expect(actual.min).toBe(expected.year.min)
    expect(actual.max).toBe(expected.year.max)
    expect(actual.bubbles).toHaveLength(expected.data.length)

    const totalMonths = actual.years.length * 12

    expected.data.forEach((entry, index) => {
      const bubble = expected.createBubble(
        12,
        expected.year.min,
        entry.start,
        entry.end
      )
      const ported = actual.bubbles[index]

      expect(ported.label).toBe(entry.label)
      expect(ported.type).toBe(entry.type)
      expect(ported.months).toBe(bubble.getMonths())
      expect((ported.offset / 100) * totalMonths).toBeCloseTo(
        bubble.getStartOffset(),
        6
      )
      expect((ported.width / 100) * totalMonths).toBeCloseTo(
        bubble.getWidth(),
        6
      )
    })
  })
})

describe('bareYearEnd="december"', () => {
  // The opt-in reading: a bare end year is inclusive, so it always means the
  // whole of that year no matter where it appears.
  it.each([
    ['2002', '2003', 12, 24],
    ['2002', '2004', 24, 36],
    ['04/2002', '2003', 9, 21],
    ['12/2002', '2003', 1, 13],
  ] as const)(
    '%s to %s is %i months upstream and %i in december mode',
    (start, end, legacy, december) => {
      expect(upstreamMonths(start, end)).toBe(legacy)
      expect(portMonths(start, end)).toBe(legacy)
      expect(portMonths(start, end, 'december')).toBe(december)
    }
  )

  it('only ever differs on a bare end year in a later year', () => {
    const starts = ['2002', '01/2002', '04/2002', '09/2002', '12/2002']
    const ends = [
      null,
      '2002',
      '2003',
      '2005',
      '01/2003',
      '04/2003',
      '12/2003',
      '12/2005',
    ]

    const divergent = starts.flatMap((start) =>
      ends
        .filter(
          (end) =>
            portMonths(start, end, 'december') !== upstreamMonths(start, end)
        )
        .map((end) => end as string)
    )

    expect(divergent.length).toBeGreaterThan(0)

    for (const end of divergent) {
      expect(end).toMatch(/^\d{4}$/)
      expect(end).not.toBe('2002')
    }
  })
})
