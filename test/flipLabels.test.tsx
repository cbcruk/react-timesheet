import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import Timesheet from '../src'
import { BUBBLE_GAP } from '../src/Timesheet/Bubble/style'
import type { TimesheetEntry } from '../src/Timesheet/types'

// jsdom reports every box as zero sized, so the measurements have to be
// stubbed. The model mirrors the real layout closely enough to exercise the
// decision: text is a fixed width per character, `scrollWidth` is always the
// untruncated width, and `offsetWidth` honours the cap the component applies.
const LIST_WIDTH = 1000
const PX_PER_CHAR = 7

const natural = (element: Element | null | undefined) =>
  (element?.textContent ?? '').length * PX_PER_CHAR

function capOf(element: HTMLElement | null) {
  const value = Number.parseFloat(element?.style.maxWidth ?? '')

  return Number.isNaN(value) ? Number.POSITIVE_INFINITY : value
}

function stubLayout(width = LIST_WIDTH) {
  Object.defineProperty(HTMLUListElement.prototype, 'clientWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return this.classList.contains('react-timesheet__data') ? width : 0
    },
  })

  Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return natural(this)
    },
  })

  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      if (this.classList.contains('react-timesheet__text')) {
        return Math.min(natural(this), capOf(this))
      }

      if (this.classList.contains('react-timesheet__label')) {
        const parent = this.parentElement
        const date = parent?.querySelector('.react-timesheet__date')
        const room = capOf(parent) - natural(date)

        return Math.min(natural(this), Math.max(room, 0))
      }

      return 0
    },
  })
}

afterEach(() => {
  // @ts-expect-error restoring the prototype getters added above
  delete HTMLUListElement.prototype.clientWidth
  // @ts-expect-error restoring the prototype getters added above
  delete HTMLElement.prototype.offsetWidth
  // @ts-expect-error restoring the prototype getters added above
  delete HTMLElement.prototype.scrollWidth
  vi.unstubAllGlobals()
})

const rows = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('.react-timesheet__row'))

describe('label flipping', () => {
  it('flips a row whose label would run off the right edge', () => {
    stubLayout()

    // 2013 sits at the far right of a 2002-2013 scale, and the label is long.
    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[['2013-01', '2013-06', 'A label long enough to overflow', '']]}
      />
    )

    const [row] = rows(container)

    expect(row).toHaveAttribute('data-flipped')
    expect(row.style.left).toBe('')
    expect(row.style.right).not.toBe('')
  })

  it('leaves a row alone when its label fits on the right', () => {
    stubLayout()

    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[['2002-01', '2002-06', 'A', '']]}
      />
    )

    const [row] = rows(container)

    expect(row).not.toHaveAttribute('data-flipped')
    expect(row.style.left).toBe('0%')
    expect(row.style.right).toBe('')
  })

  it('caps the text instead when it fits on neither side', () => {
    stubLayout()

    // A bubble spanning almost the whole scale: the text overflows on the
    // right, and flipping would push it off the left instead.
    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[
          [
            '2002-02',
            '2013-06',
            'A label long enough to overflow either way',
            '',
          ],
        ]}
      />
    )

    const [row] = rows(container)
    const text = row.querySelector<HTMLElement>('.react-timesheet__text')!

    // 2002-02 to 2013-06 is 1/144 in and 137 wide, so the right has the room.
    expect(row).not.toHaveAttribute('data-flipped')
    expect(Number.parseFloat(text.style.maxWidth)).toBe(
      Math.floor(1000 - ((1 + 137) / 144) * 1000 - BUBBLE_GAP)
    )
  })

  it('caps on the left when that is the roomier side', () => {
    stubLayout()

    // 2002-01 to 2012-12 leaves 1 year on the right and nothing on the left,
    // so shift the window: start late, end at the very edge.
    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[
          [
            '2005-01',
            '2013-12',
            'A label long enough to overflow either way',
            '',
          ],
        ]}
      />
    )

    const [row] = rows(container)
    const text = row.querySelector<HTMLElement>('.react-timesheet__text')!

    expect(row).toHaveAttribute('data-flipped')
    expect(Number.parseFloat(text.style.maxWidth)).toBe(
      Math.floor((36 / 144) * 1000 - BUBBLE_GAP)
    )
  })

  it('leaves the cap off when the text fits', () => {
    stubLayout()

    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[['2002-01', '2002-06', 'A', '']]}
      />
    )

    const text = rows(container)[0].querySelector<HTMLElement>(
      '.react-timesheet__text'
    )!

    expect(text.style.maxWidth).toBe('')
  })

  it('pins a flipped bubble to the same right edge it had before', () => {
    stubLayout()

    // 2013-01 to 2013-06 on a 2002-2013 scale: 132 of 144 months in, 6 wide.
    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[['2013-01', '2013-06', 'A label long enough to overflow', '']]}
      />
    )

    const [row] = rows(container)
    const right = Number.parseFloat(row.style.right)

    expect(100 - right).toBeCloseTo(((132 + 6) / 144) * 100, 6)
  })

  it('never flips when flipLabels is false', () => {
    stubLayout()

    const data: TimesheetEntry[] = [
      ['2013-01', '2013-06', 'A label long enough to overflow', ''],
    ]

    const { container } = render(
      <Timesheet min={2002} max={2013} data={data} flipLabels={false} />
    )

    const [row] = rows(container)

    expect(row).not.toHaveAttribute('data-flipped')
    expect(row.style.left).not.toBe('')
  })

  it('re-measures when the timesheet is resized', () => {
    const observe = vi.fn()
    const disconnect = vi.fn()
    let notify: (() => void) | undefined

    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback
        }
        observe = observe
        disconnect = disconnect
      }
    )

    stubLayout(1000)

    const { container, unmount } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[['2013-01', '2013-06', 'A label long enough to overflow', '']]}
      />
    )

    expect(observe).toHaveBeenCalled()
    expect(rows(container)[0]).toHaveAttribute('data-flipped')

    // A much wider timesheet leaves room for the label on the right again:
    // the bubble ends at 138/144 of the scale, so the remaining 4% has to
    // cover the ~320px of text.
    stubLayout(20000)
    act(() => notify?.())

    expect(rows(container)[0]).not.toHaveAttribute('data-flipped')

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('renders without a ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    stubLayout()

    const { container } = render(
      <Timesheet
        min={2002}
        max={2013}
        data={[['2013-01', '2013-06', 'A label long enough to overflow', '']]}
      />
    )

    expect(rows(container)[0]).toHaveAttribute('data-flipped')
  })
})
