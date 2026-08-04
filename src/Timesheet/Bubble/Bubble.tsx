import type { KeyboardEvent } from 'react'
import { cx } from '@emotion/css'
import { colorVar, slugify } from '../colors'
import { Props } from './types'
import * as styles from './style'

function Bubble({ bubble, showDates = true, onClick }: Props) {
  const { label, type, dateLabel, months, offset, width } = bubble
  const interactive = Boolean(onClick)

  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>) {
    if (!onClick) {
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <li
      className={cx(
        styles.ROW_CLASS,
        styles.wrapper,
        interactive && styles.clickable
      )}
      style={{ left: `${offset}%` }}
      data-type={type}
      data-months={months}
      title={`${label} (${dateLabel})`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <span
        className={cx(
          styles.BUBBLE_CLASS,
          styles.bubble,
          `is-${slugify(type)}`
        )}
        style={{
          width: `${width}%`,
          backgroundColor: `var(${colorVar(type)}, var(${colorVar('default')}))`,
        }}
      />
      {showDates ? (
        <span className={cx(styles.DATE_CLASS, styles.date)}>{dateLabel}</span>
      ) : null}
      <span className={cx(styles.LABEL_CLASS, styles.label)}>{label}</span>
    </li>
  )
}

export default Bubble
