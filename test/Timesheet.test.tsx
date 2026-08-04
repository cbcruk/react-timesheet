import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Timesheet from '../src'
import { COLOR_SCHEMES } from '../src/Timesheet/colors'
import type { TimesheetEntry } from '../src/Timesheet/types'

const data: TimesheetEntry[] = [
  ['2002-01', '2002-09', 'A freaking awesome time', 'lorem'],
  ['2002-06', '2003-09', 'Some great memories', 'ipsum'],
  ['2003-01', '2003-12', 'Had very bad luck', 'default'],
]

describe('<Timesheet />', () => {
  it('renders without crashing', () => {
    render(<Timesheet min={0} max={1} data={[]} />)
  })

  it('renders one year per section of the scale', () => {
    render(<Timesheet min={2002} max={2005} data={[]} />)

    for (const year of [2002, 2003, 2004, 2005]) {
      expect(screen.getByText(String(year))).toBeInTheDocument()
    }
  })

  it('renders one list item per entry', () => {
    render(<Timesheet data={data} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders labels and date ranges', () => {
    render(<Timesheet data={data} />)

    expect(screen.getByText('A freaking awesome time')).toBeInTheDocument()
    expect(screen.getByText('01/2002-09/2002')).toBeInTheDocument()
  })

  it('hides the date ranges when asked', () => {
    render(<Timesheet data={data} showDates={false} />)

    expect(screen.queryByText('01/2002-09/2002')).not.toBeInTheDocument()
    expect(screen.getByText('A freaking awesome time')).toBeInTheDocument()
  })

  it('sorts entries by start date', () => {
    render(
      <Timesheet
        data={[
          ['2005-01', '2005-06', 'later', 'lorem'],
          ['2002-01', '2002-06', 'earlier', 'lorem'],
        ]}
      />
    )

    const items = screen.getAllByRole('listitem')

    expect(items[0]).toHaveTextContent('earlier')
    expect(items[1]).toHaveTextContent('later')
  })

  it('positions bubbles relative to the scale', () => {
    render(
      <Timesheet
        min={2002}
        max={2003}
        data={[['2003-01', '2003-06', 'A', '']]}
      />
    )

    const [item] = screen.getAllByRole('listitem')

    expect(item).toHaveStyle({ left: '50%' })
    expect(item).toHaveAttribute('data-months', '6')
  })

  it('exposes the category as a data attribute', () => {
    render(<Timesheet data={data} />)

    const items = screen.getAllByRole('listitem')

    expect(items.map((item) => item.dataset.type)).toEqual([
      'lorem',
      'ipsum',
      'default',
    ])
  })

  it('applies the requested color scheme as custom properties', () => {
    const { container, rerender } = render(
      <Timesheet data={data} colorScheme="default" />
    )
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--react-timesheet-color-lorem')).toBe(
      COLOR_SCHEMES.default.lorem
    )

    rerender(<Timesheet data={data} colorScheme="alternative" />)

    expect(root.style.getPropertyValue('--react-timesheet-color-lorem')).toBe(
      COLOR_SCHEMES.alternative.lorem
    )
  })

  it('lets custom colors override the scheme', () => {
    const { container } = render(
      <Timesheet data={data} colors={{ lorem: '#09f' }} />
    )
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--react-timesheet-color-lorem')).toBe(
      '#09f'
    )
  })

  it('gives an unknown category the default color', () => {
    const { container } = render(
      <Timesheet data={[['2002-01', '2002-06', 'A', 'unknown']]} />
    )
    const root = container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--react-timesheet-color-unknown')).toBe(
      COLOR_SCHEMES.default.default
    )
  })

  it('switches theme colors', () => {
    const { container } = render(<Timesheet data={data} theme="light" />)
    const root = container.firstElementChild as HTMLElement

    expect(root).toHaveAttribute('data-theme', 'light')
    expect(root.style.getPropertyValue('--react-timesheet-background')).toBe(
      'rgba(251, 251, 251, 1)'
    )
  })

  it('switches year-only end date semantics', () => {
    const entry: TimesheetEntry[] = [['2002-01', '2004', 'A', 'lorem']]

    const { getAllByRole, rerender } = render(<Timesheet data={entry} />)

    // Default matches timesheet.js: the end year is an exclusive boundary.
    expect(getAllByRole('listitem')[0]).toHaveAttribute('data-months', '24')

    rerender(<Timesheet data={entry} bareYearEnd="december" />)

    expect(getAllByRole('listitem')[0]).toHaveAttribute('data-months', '36')
  })

  it('exposes stable class names for consumer styling', () => {
    const { container } = render(<Timesheet data={data} />)

    expect(container.querySelector('.react-timesheet')).toBeInTheDocument()
    expect(
      container.querySelector('.react-timesheet__scale')
    ).toBeInTheDocument()
    expect(
      container.querySelector('.react-timesheet__data')
    ).toBeInTheDocument()
    expect(container.querySelectorAll('.react-timesheet__row')).toHaveLength(3)
    expect(container.querySelectorAll('.react-timesheet__bubble')).toHaveLength(
      3
    )
  })

  it('emits a valid hover rule instead of inlining the bubble styles', () => {
    render(<Timesheet data={data} />)

    // Interpolating an emotion class into a selector inlines its declarations
    // and yields `.{opacity:1;}`, which no browser (or jsdom) can parse.
    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('')

    expect(css).toContain(':hover .react-timesheet__bubble')
    expect(css).not.toMatch(/[\s,]\.\s*\{/)
  })

  it('forwards className and style', () => {
    const { container } = render(
      <Timesheet data={data} className="custom" style={{ maxWidth: 640 }} />
    )
    const root = container.firstElementChild as HTMLElement

    expect(root).toHaveClass('custom')
    expect(root).toHaveStyle({ maxWidth: '640px' })
  })

  it('is not interactive without a click handler', () => {
    render(<Timesheet data={data} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onBubbleClick with the bubble and its index', async () => {
    const onBubbleClick = vi.fn()
    const user = userEvent.setup()

    render(<Timesheet data={data} onBubbleClick={onBubbleClick} />)

    await user.click(screen.getAllByRole('button')[1])

    expect(onBubbleClick).toHaveBeenCalledTimes(1)
    expect(onBubbleClick.mock.calls[0][0]).toMatchObject({
      label: 'Some great memories',
      type: 'ipsum',
    })
    expect(onBubbleClick.mock.calls[0][1]).toBe(1)
  })

  it('activates a bubble with the keyboard', async () => {
    const onBubbleClick = vi.fn()
    const user = userEvent.setup()

    render(<Timesheet data={data} onBubbleClick={onBubbleClick} />)

    await user.tab()
    await user.keyboard('{Enter}')

    expect(onBubbleClick).toHaveBeenCalledTimes(1)
    expect(onBubbleClick.mock.calls[0][1]).toBe(0)
  })
})
