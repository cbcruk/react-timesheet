import React from 'react'
import { Props } from './types'
import * as styles from './style'

function Scale({ years }: Props) {
  return (
    <div className={styles.wrapper}>
      {years.map(year => (
        <span key={year} className={styles.section}>
          {year}
        </span>
      ))}
    </div>
  )
}

export default Scale
