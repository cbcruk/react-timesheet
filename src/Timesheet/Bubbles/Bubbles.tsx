import { useCallback, useRef, useState } from 'react'
import { cx } from '@emotion/css'
import Bubble from '../Bubble'
import { BUBBLE_GAP, LABEL_CLASS, TEXT_CLASS } from '../Bubble/style'
import type { Placement } from '../Bubble/types'
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect'
import { Props } from './types'
import * as styles from './style'

const NONE: readonly Placement[] = []
const RIGHT: Placement = { flipped: false }

function same(a: readonly Placement[], b: readonly Placement[]) {
  return (
    a.length === b.length &&
    a.every(
      (placement, index) =>
        placement.flipped === b[index].flipped &&
        placement.maxWidth === b[index].maxWidth
    )
  )
}

function Bubbles({
  bubbles,
  showDates,
  flipLabels = true,
  onBubbleClick,
}: Props) {
  const listRef = useRef<HTMLUListElement>(null)
  const [placements, setPlacements] = useState<readonly Placement[]>(NONE)

  /**
   * A label's width depends on its text and the current font, so where it fits
   * can only be decided from real layout.
   *
   * The natural text width is reconstructed as "everything but the label" plus
   * the label's `scrollWidth`, which stays the untruncated content width even
   * once a cap is applied. That keeps the measurement independent of the
   * placement it produces, so this cannot oscillate.
   */
  const measure = useCallback(() => {
    const list = listRef.current

    if (!list) {
      return
    }

    const available = list.clientWidth

    if (!available) {
      return
    }

    const next = bubbles.map((bubble, index): Placement => {
      const row = list.children[index]
      const text = row?.querySelector(`.${TEXT_CLASS}`)
      const label = row?.querySelector(`.${LABEL_CLASS}`)

      if (!(text instanceof HTMLElement) || !(label instanceof HTMLElement)) {
        return RIGHT
      }

      const natural = text.offsetWidth - label.offsetWidth + label.scrollWidth
      const start = (bubble.offset / 100) * available
      const end = ((bubble.offset + bubble.width) / 100) * available
      // The text starts past the bubble's margin, on whichever side it lands.
      const roomRight = available - end - BUBBLE_GAP
      const roomLeft = start - BUBBLE_GAP

      if (natural <= roomRight) {
        return RIGHT
      }

      if (natural <= roomLeft) {
        return { flipped: true }
      }

      // Neither side fits — a bubble spanning most of the scale. Use whichever
      // side has more room and let the label ellipsise.
      return roomLeft > roomRight
        ? { flipped: true, maxWidth: Math.floor(roomLeft) }
        : { flipped: false, maxWidth: Math.floor(roomRight) }
    })

    setPlacements((previous) => (same(previous, next) ? previous : next))
  }, [bubbles])

  useIsomorphicLayoutEffect(() => {
    if (!flipLabels) {
      setPlacements((previous) => (previous.length ? NONE : previous))
      return
    }

    measure()

    const list = listRef.current

    if (!list || typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(measure)

    observer.observe(list)

    return () => observer.disconnect()
  }, [measure, flipLabels, showDates])

  return (
    <ul className={cx(styles.LIST_CLASS, styles.wrapper)} ref={listRef}>
      {bubbles.map((bubble, index) => (
        <Bubble
          key={`${bubble.dateLabel}-${bubble.label}-${index}`}
          bubble={bubble}
          showDates={showDates}
          placement={placements[index]}
          onClick={
            onBubbleClick ? () => onBubbleClick(bubble, index) : undefined
          }
        />
      ))}
    </ul>
  )
}

export default Bubbles
