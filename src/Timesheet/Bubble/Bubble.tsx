import type { KeyboardEvent } from 'react'
import { cx } from '@emotion/css'
import { colorVar, slugify } from '../colors'
import { Props } from './types'
import * as styles from './style'

const DEFAULT_PLACEMENT = { flipped: false } as const

function Bubble({
  bubble,
  showDates = true,
  placement = DEFAULT_PLACEMENT,
  onClick,
}: Props) {
  const { label, type, dateLabel, months, offset, width } = bubble
  const { flipped, maxWidth } = placement
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
        flipped && styles.flipped,
        interactive && styles.clickable
      )}
      // A flipped row is pinned by its right edge so the bubble still ends
      // where it should; the text then runs leftward from the bubble.
      style={
        flipped ? { right: `${100 - offset - width}%` } : { left: `${offset}%` }
      }
      data-type={type}
      data-months={months}
      data-flipped={flipped ? '' : undefined}
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
      <span className={cx(styles.TEXT_CLASS, styles.text)} style={{ maxWidth }}>
        {showDates ? (
          <span className={cx(styles.DATE_CLASS, styles.date)}>
            {dateLabel}
          </span>
        ) : null}
        <span className={cx(styles.LABEL_CLASS, styles.label)}>{label}</span>
      </span>
    </li>
  )
}

export default Bubble
