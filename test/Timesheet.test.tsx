import * as React from 'react'
import { render } from '@testing-library/react'
import Timesheet from '../src'

describe('<Timesheet />', () => {
  it('renders without crashing', () => {
    render(<Timesheet min={0} max={1} data={[]} />)
  })
})
