import { describe, expect, it } from 'vitest'
import { getBubbles, normalizeEntry, range } from '../src/Timesheet/helper'
import type { TimesheetEntry } from '../src/Timesheet/types'

describe('range', () => {
  it('is inclusive on both ends', () => {
    expect(range(2002, 2005)).toEqual([2002, 2003, 2004, 2005])
    expect(range(2002, 2002)).toEqual([2002])
  })
})

describe('normalizeEntry', () => {
  it('reads a four item tuple as start, end, label and type', () => {
    expect(normalizeEntry(['2002-01', '2002-09', 'Label', 'lorem'])).toEqual({
      start: '2002-01',
      end: '2002-09',
      label: 'Label',
      type: 'lorem',
    })
  })

  it('reads a three item tuple as an open ended entry with a type', () => {
    expect(normalizeEntry(['2002-01', 'Label', 'lorem'])).toEqual({
      start: '2002-01',
      end: null,
      label: 'Label',
      type: 'lorem',
    })
  })

  it('reads a two item tuple as an open ended default entry', () => {
    expect(normalizeEntry(['2002-01', 'Label'])).toEqual({
      start: '2002-01',
      end: null,
      label: 'Label',
      type: 'default',
    })
  })

  it('accepts the object form', () => {
    expect(normalizeEntry({ start: '2002', label: 'Label' })).toEqual({
      start: '2002',
      end: null,
      label: 'Label',
      type: 'default',
    })
  })

  it('rejects a tuple that is too short', () => {
    expect(() => normalizeEntry(['2002'] as unknown as TimesheetEntry)).toThrow(
      TypeError
    )
  })
})

describe('getBubbles', () => {
  it('derives the scale from the data when no bounds are given', () => {
    const { min, max, years } = getBubbles([
      ['2004-01', '2005-06', 'B', 'lorem'],
      ['2002-01', '2003-06', 'A', 'lorem'],
    ])

    expect(min).toBe(2002)
    expect(max).toBe(2005)
    expect(years).toEqual([2002, 2003, 2004, 2005])
  })

  it('widens the requested range instead of clipping entries', () => {
    const { min, max } = getBubbles([['2000-01', '2020-01', 'A', 'lorem']], {
      min: 2010,
      max: 2011,
    })

    expect(min).toBe(2000)
    expect(max).toBe(2020)
  })

  it('keeps the requested range when it is wider than the data', () => {
    const { years } = getBubbles([['2005-01', '2005-06', 'A', 'lorem']], {
      min: 2002,
      max: 2008,
    })

    expect(years).toEqual([2002, 2003, 2004, 2005, 2006, 2007, 2008])
  })

  it('positions a bubble as a percentage of the whole scale', () => {
    const { bubbles } = getBubbles([['2002-01', '2002-12', 'A', 'lorem']], {
      min: 2002,
      max: 2003,
    })

    // One of two years: the first twelve of twenty-four months.
    expect(bubbles[0].offset).toBe(0)
    expect(bubbles[0].width).toBe(50)
    expect(bubbles[0].months).toBe(12)
  })

  it('offsets a bubble by its distance from the first year', () => {
    const { bubbles } = getBubbles([['2003-01', '2003-06', 'A', 'lorem']], {
      min: 2002,
      max: 2003,
    })

    expect(bubbles[0].offset).toBe(50)
    expect(bubbles[0].width).toBe((6 / 24) * 100)
  })

  it('sorts entries by start date by default', () => {
    const { bubbles } = getBubbles([
      ['2005-01', '2005-06', 'third', 'lorem'],
      ['2002-01', '2002-06', 'first', 'lorem'],
      ['2003-06', '2003-09', 'second', 'lorem'],
    ])

    expect(bubbles.map((bubble) => bubble.label)).toEqual([
      'first',
      'second',
      'third',
    ])
  })

  it('keeps the given order when sorting is disabled', () => {
    const { bubbles } = getBubbles(
      [
        ['2005-01', '2005-06', 'third', 'lorem'],
        ['2002-01', '2002-06', 'first', 'lorem'],
      ],
      { sort: false }
    )

    expect(bubbles.map((bubble) => bubble.label)).toEqual(['third', 'first'])
  })

  it('lays out an open ended entry as a single month', () => {
    const { bubbles } = getBubbles([['2002-06', 'A']], {
      min: 2002,
      max: 2002,
    })

    expect(bubbles[0].months).toBe(1)
    expect(bubbles[0].width).toBe((1 / 12) * 100)
    expect(bubbles[0].offset).toBe((5 / 12) * 100)
    expect(bubbles[0].dateLabel).toBe('06/2002')
  })

  it('lays out a year-only entry across its whole year', () => {
    const { bubbles } = getBubbles([['2003', 'A']], { min: 2002, max: 2003 })

    expect(bubbles[0].months).toBe(12)
    expect(bubbles[0].width).toBe(50)
    expect(bubbles[0].offset).toBe(50)
    expect(bubbles[0].dateLabel).toBe('2003')
  })

  it('defaults the type of an untyped entry', () => {
    const { bubbles } = getBubbles([['2002-01', '2002-06', 'A', '']])

    expect(bubbles[0].type).toBe('default')
  })

  it('falls back to the current year for empty data', () => {
    const { min, max, years, bubbles } = getBubbles([])

    expect(min).toBe(max)
    expect(years).toHaveLength(1)
    expect(bubbles).toEqual([])
  })

  it('honours explicit bounds for empty data', () => {
    expect(getBubbles([], { min: 2002, max: 2004 }).years).toEqual([
      2002, 2003, 2004,
    ])
  })

  it('accepts the object form alongside tuples', () => {
    const { bubbles } = getBubbles([
      { start: '2002-01', end: '2002-06', label: 'A', type: 'lorem' },
      ['2003-01', '2003-06', 'B', 'ipsum'],
    ])

    expect(bubbles.map((bubble) => bubble.type)).toEqual(['lorem', 'ipsum'])
  })
})
