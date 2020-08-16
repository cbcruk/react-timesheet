import React from 'react'
import Bubbles from './Bubbles'
import Scale from './Scale'
import { getBubbles } from './helper'
import { Props } from './types'
import * as styles from './style'

function Timesheet({ data, min, max }: Props) {
  const { years, bubbles } = getBubbles(data, [min, max])

  return (
    <div className={styles.wrapper}>
      <Scale years={years} />
      <Bubbles bubbles={bubbles} />
    </div>
  )
}

export default Timesheet
