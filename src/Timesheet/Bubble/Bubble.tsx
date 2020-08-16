import React from 'react'
import { cx } from 'emotion'
import { Props } from './types'
import * as styles from './style'

function Bubble({ label, type, start, end, width, offset }: Props) {
  return (
    <div
      className={styles.wrapper}
      style={{
        left: `${offset}%`,
      }}
    >
      <span
        className={cx([styles.bubble, `is-${type}`])}
        style={{
          width: `${width}%`,
        }}
      />
      <span className={styles.date}>
        {start}-{end}
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}

export default Bubble
