import { useMemo, type CSSProperties } from 'react'
import { cx } from '@emotion/css'
import Bubbles from './Bubbles'
import Scale from './Scale'
import { getCssVariables } from './colors'
import { getBubbles } from './helper'
import { Props } from './types'
import * as styles from './style'

function Timesheet({
  data,
  min,
  max,
  colorScheme = 'default',
  theme = 'dark',
  colors,
  sort = true,
  showDates = true,
  onBubbleClick,
  className,
  style,
}: Props) {
  const { years, bubbles } = useMemo(
    () => getBubbles(data, { min, max, sort }),
    [data, min, max, sort]
  )

  const variables = useMemo(
    () =>
      getCssVariables({
        theme,
        colorScheme,
        colors,
        types: bubbles.map((bubble) => bubble.type),
      }),
    [theme, colorScheme, colors, bubbles]
  )

  return (
    <div
      className={cx(styles.ROOT_CLASS, styles.wrapper, className)}
      style={{ ...variables, ...style } as CSSProperties}
      data-theme={theme}
      data-color-scheme={colorScheme}
    >
      <Scale years={years} />
      <Bubbles
        bubbles={bubbles}
        showDates={showDates}
        onBubbleClick={onBubbleClick}
      />
    </div>
  )
}

export default Timesheet
