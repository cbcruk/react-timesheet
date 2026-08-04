import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Timesheet from 'react-timesheet'
import type {
  Bubble,
  ColorScheme,
  Theme,
  TimesheetEntry,
} from 'react-timesheet'

const data: TimesheetEntry[] = [
  ['2002-01', '2002-09', 'A freaking awesome time', 'lorem'],
  ['2002-06', '2003-09', 'Some great memories', 'ipsum'],
  ['2003-01', '2003-12', 'Had very bad luck', 'default'],
  ['2003-10', '2006-12', 'At least had fun', 'dolor'],
  ['2005-02', '2006-05', 'Enjoyed those times as well', 'ipsum'],
  ['2005-07', '2005-09', 'Bad luck again', 'default'],
  ['2005-10', '2008-12', 'For a long time nothing happened', 'dolor'],
  ['2008-01', '2009-05', 'LOST Season #4', 'lorem'],
  ['2009-01', '2009-05', 'LOST Season #5', 'lorem'],
  ['2010-02', '2010-05', 'LOST Season #6', 'lorem'],
  ['2008-09', '2010-06', 'FRINGE #1 & #2', 'ipsum'],
  ['2011', 'A whole year off', 'sit'],
  ['2012-04', 'Started something new'],
]

function App() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('default')
  const [selected, setSelected] = useState<Bubble | null>(null)

  return (
    <main>
      <h1>react-timesheet</h1>
      <p className="lead">
        A React implementation of timesheet.js. Click a row to select it.
      </p>

      <div className="controls">
        <label>
          Theme
          <select
            value={theme}
            onChange={(event) => setTheme(event.target.value as Theme)}
          >
            <option value="dark">dark</option>
            <option value="light">light</option>
          </select>
        </label>

        <label>
          Colors
          <select
            value={colorScheme}
            onChange={(event) =>
              setColorScheme(event.target.value as ColorScheme)
            }
          >
            <option value="default">default</option>
            <option value="alternative">alternative</option>
          </select>
        </label>
      </div>

      <Timesheet
        data={data}
        min={2002}
        max={2013}
        theme={theme}
        colorScheme={colorScheme}
        onBubbleClick={setSelected}
      />

      <p className="selection">
        {selected
          ? `${selected.label} — ${selected.dateLabel} (${selected.months} months)`
          : 'Nothing selected.'}
      </p>
    </main>
  )
}

const container = document.getElementById('root')

if (!container) {
  throw new Error('Missing #root element')
}

createRoot(container).render(<App />)
