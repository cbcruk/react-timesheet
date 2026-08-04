import { cx } from '@emotion/css'
import { Props } from './types'
import * as styles from './style'

function Scale({ years }: Props) {
  return (
    <div className={cx(styles.SCALE_CLASS, styles.wrapper)} aria-hidden="true">
      {years.map((year) => (
        <span
          key={year}
          className={cx(styles.SECTION_CLASS, styles.section)}
          data-year={year}
        >
          {year}
        </span>
      ))}
    </div>
  )
}

export default Scale
