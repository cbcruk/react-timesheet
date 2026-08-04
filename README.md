# react-timesheet

A React implementation of [timesheet.js](https://github.com/sbstjn/timesheet.js) —
render a compact HTML timeline from a list of dated events.

```tsx
import Timesheet from 'react-timesheet'

function App() {
  return (
    <Timesheet
      data={[
        ['2002-01', '2002-09', 'A freaking awesome time', 'lorem'],
        ['2002-06', '2003-09', 'Some great memories', 'ipsum'],
        ['2003-01', '2003-12', 'Had very bad luck', 'default'],
        ['2011', 'A whole year off', 'sit'],
        ['2012-04', 'Started something new'],
      ]}
    />
  )
}
```

No stylesheet import is needed — styles ship with the component via
[`@emotion/css`](https://emotion.sh/docs/@emotion/css).

## Install

```sh
npm install react-timesheet
```

`react` (>= 16.8) is a peer dependency.

## Data

Entries come in tuple form, matching `timesheet.js`, or in object form.
Tuple arity decides what each slot means:

| Tuple                       | Meaning                             |
| --------------------------- | ----------------------------------- |
| `[start, end, label, type]` | a range with a category             |
| `[start, label, type]`      | an open ended entry with a category |
| `[start, label]`            | an open ended entry using `default` |

```tsx
// Equivalent to ['2002-01', '2002-09', 'Label', 'lorem']
<Timesheet
  data={[{ start: '2002-01', end: '2002-09', label: 'Label', type: 'lorem' }]}
/>
```

Note that a three item tuple is an _open ended_ entry, not a range — only a
four item tuple carries an end date. This mirrors `timesheet.js`.

### Dates

Both the `timesheet.js` ordering and the ISO-ish ordering are accepted:

| Format       | Example      | Spans                    |
| ------------ | ------------ | ------------------------ |
| `YYYY`       | `2002`       | the whole year           |
| `YYYY-MM`    | `2002-09`    | that month               |
| `MM/YYYY`    | `09/2002`    | that month               |
| `YYYY-MM-DD` | `2002-09-17` | that month (day ignored) |

Both ends of a range are inclusive, so `['2002-01', '2002-09', …]` is nine
months long. A year-only start begins in January. An entry with no end date
covers a single month, or a full year when its start has no month. A year-only
_end_ is the one case with two possible readings — see
[below](#year-only-end-dates).

Anything else throws a `TypeError` with the offending value, rather than
silently rendering a zero width bubble.

### Year-only end dates

A bare end year is the one place two readings are possible, and `bareYearEnd`
selects between them:

| `bareYearEnd`          | `['2002-01', '2004', …]` | Meaning                 |
| ---------------------- | ------------------------ | ----------------------- |
| `'legacy'` _(default)_ | 24 months                | up to the start of 2004 |
| `'december'`           | 36 months                | through December 2004   |

The default reproduces `timesheet.js` exactly, including its discontinuity:
`['04/2002', '2002']` and `['04/2002', '2003']` both measure 9 months, so a bare
end year is inclusive within one year but exclusive across years — which means
an end year later than the start year contributes nothing beyond the years
between them. `'december'` removes that wrinkle by making a bare year mean the
whole of that year wherever it appears, at the cost of parity.

Both readings are locked in by [`test/parity.test.ts`](test/parity.test.ts),
which runs the upstream implementation and this port against the same inputs.

## Props

| Prop            | Type                                      | Default     | Description                                                  |
| --------------- | ----------------------------------------- | ----------- | ------------------------------------------------------------ |
| `data`          | `TimesheetEntry[]`                        | —           | Entries to render.                                           |
| `min`           | `number`                                  | from `data` | First year of the scale.                                     |
| `max`           | `number`                                  | from `data` | Last year of the scale.                                      |
| `colorScheme`   | `'default' \| 'alternative'`              | `'default'` | Built-in palette.                                            |
| `theme`         | `'dark' \| 'light'`                       | `'dark'`    | Background and text palette.                                 |
| `colors`        | `Record<string, string>`                  | —           | Per-category color overrides, e.g. `{ lorem: '#09f' }`.      |
| `sort`          | `boolean`                                 | `true`      | Sort entries by start date.                                  |
| `bareYearEnd`   | `'legacy' \| 'december'`                  | `'legacy'`  | How to read a year-only end date. See above.                 |
| `showDates`     | `boolean`                                 | `true`      | Render the date range next to each label.                    |
| `onBubbleClick` | `(bubble: Bubble, index: number) => void` | —           | Makes each row focusable and clickable.                      |
| `className`     | `string`                                  | —           | Appended to the root class list.                             |
| `style`         | `CSSProperties`                           | —           | Merged onto the root, after the generated custom properties. |

`min` and `max` bound the scale but only ever widen it: an entry outside the
requested range pushes the range out rather than being clipped. Omit them and
the range is derived entirely from `data`.

## Styling

Colors are emitted as CSS custom properties on the root element, so they can be
overridden from your own stylesheet as well as through the `colors` prop:

```css
.react-timesheet {
  --react-timesheet-color-lorem: #09f;
  --react-timesheet-background: #111;
}
```

| Variable                             | Purpose                  |
| ------------------------------------ | ------------------------ |
| `--react-timesheet-color-<category>` | Bubble fill per category |
| `--react-timesheet-background`       | Root background          |
| `--react-timesheet-border`           | Top border               |
| `--react-timesheet-scale`            | Year labels              |
| `--react-timesheet-scale-line`       | Dashed year separators   |
| `--react-timesheet-date`             | Date text                |
| `--react-timesheet-label`            | Label text               |

Category names are slugified, so `type: 'On call'` reads
`--react-timesheet-color-on-call`. A category with no color falls back to
`--react-timesheet-color-default`.

Stable class names are attached alongside the generated ones:
`.react-timesheet`, `.react-timesheet__scale`, `.react-timesheet__year`,
`.react-timesheet__data`, `.react-timesheet__row`, `.react-timesheet__bubble`,
`.react-timesheet__date`, `.react-timesheet__label`. Each row also carries
`data-type` and `data-months`, and the root carries `data-theme` and
`data-color-scheme`.

## Helpers

The layout math is exported so it can be used without rendering:

```ts
import { getBubbles, parseDate, getMonthSpan } from 'react-timesheet'

const { min, max, years, bubbles } = getBubbles(data, { min: 2002 })
```

- `getBubbles(data, { min, max, sort, bareYearEnd })` — the full layout: year
  range plus positioned bubbles with `offset`/`width` as percentages.
- `parseDate`, `formatDate`, `formatRange`, `toMonthIndex`
- `getMonthSpan(start, end, bareYearEnd)`, `getMonthOffset(date, min)`
- `normalizeEntry(entry)`, `COLOR_SCHEMES`, `THEMES`

## Differences from timesheet.js

The layout maths is a faithful port, and out of the box it computes exactly what
`timesheet.js` computes. `test/parity.test.ts` runs the upstream implementation
(vendored at `test/fixtures/timesheet.js`) side by side with this one: month
spans, start offsets, date labels, tuple arity, category defaults and scale
widening all agree. Upstream's own test vectors are asserted against the fixture
too, so drift is caught rather than assumed away.

What differs is the surrounding component, not the arithmetic:

- **Date input.** `timesheet.js` accepts `MM/YYYY` and `YYYY` only — it splits
  on `/` and otherwise runs the whole string through `parseInt`, so `'2002-09'`
  silently parses as the bare year 2002. This port accepts `YYYY-MM` and
  `YYYY-MM-DD` as well, and throws on anything it cannot read.
- **`min`/`max` are optional.** Upstream compares against `undefined` when they
  are omitted, so both are effectively required. Here the range is derived from
  the data when either is missing.
- **Responsive.** Upstream measures a year section in pixels
  (`.scale section` `offsetWidth`) and positions bubbles with pixel offsets,
  which pins the widget to a fixed width. Here offsets and widths are
  percentages, so the timesheet fills its container.
- **No fixed height.** The root grows with the number of entries instead of
  clipping at 292px.
- **Sorted by default.** Upstream renders in input order; set `sort={false}` for
  that.
- **Escaped labels.** Upstream builds rows with `innerHTML +=`, so a label
  containing markup is injected as HTML. React escapes it.
- **`data-months` instead of `data-duration`.** Upstream's duration attribute
  divides a millisecond delta by `24 * 39`, which is not a month; each row here
  carries the same month count the bubble is drawn from.
- **Semantic markup.** Rows are `<li>` elements in a `<ul>`, and the year scale
  is `aria-hidden` since it duplicates the per-row date labels.

The one arithmetic difference is opt-in: `bareYearEnd="december"`, described
[above](#year-only-end-dates).

## Development

```sh
npm install
npm run example    # Vite playground on http://localhost:5173
npm test           # Vitest
npm run lint       # Prettier + tsc
npm run build      # tsup, ESM + CJS + types
```

## License

MIT
