import { cx } from '@emotion/css'
import Bubble from '../Bubble'
import { Props } from './types'
import * as styles from './style'

function Bubbles({ bubbles, showDates, onBubbleClick }: Props) {
  return (
    <ul className={cx(styles.LIST_CLASS, styles.wrapper)}>
      {bubbles.map((bubble, index) => (
        <Bubble
          key={`${bubble.dateLabel}-${bubble.label}-${index}`}
          bubble={bubble}
          showDates={showDates}
          onClick={
            onBubbleClick ? () => onBubbleClick(bubble, index) : undefined
          }
        />
      ))}
    </ul>
  )
}

export default Bubbles
