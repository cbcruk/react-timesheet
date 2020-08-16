import 'react-app-polyfill/ie11'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Timesheet from '../.'

const App = () => {
  return (
    <Timesheet
      min={2002}
      max={2013}
      data={[
        ['2002-01', '2002-09', 'A freaking awesome time', 'lorem'],
        ['2002-06', '2003-09', 'Some great memories', 'ipsum'],
        ['2003-01', '2003-12', 'Had very bad luck', 'default'],
        ['2003-10', '2006-12', 'At least had fun', 'dolor'],
        ['2005-02', '2006-05', 'Enjoyed those times as well', 'ipsum'],
        ['2005-07', '2005-09', 'Bad luck again', 'default'],
        ['2005-10', '2008-12', 'For a long time nothing happened', 'dolor'],
        ['2008-01', '2009-05', 'LOST Season #4', 'lorem'],
        ['2009-01', '2009-05', 'LOST Season #4', 'lorem'],
        ['2010-02', '2010-05', 'LOST Season #5', 'lorem'],
        ['2008-09', '2010-06', 'FRINGE #1 & #2', 'ipsum'],
      ]}
    />
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
